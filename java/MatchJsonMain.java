package skadistats.clarity.bench;

import skadistats.clarity.Clarity;
import skadistats.clarity.event.Insert;
import skadistats.clarity.model.CombatLogEntry;
import skadistats.clarity.model.Entity;
import skadistats.clarity.processor.entities.Entities;
import skadistats.clarity.processor.entities.OnEntityCreated;
import skadistats.clarity.processor.entities.OnEntityUpdatesCompleted;
import skadistats.clarity.processor.entities.UsesEntities;
import skadistats.clarity.processor.gameevents.OnCombatLogEntry;
import skadistats.clarity.processor.runner.Context;
import skadistats.clarity.processor.runner.SimpleRunner;
import skadistats.clarity.source.MappedFileSource;
import skadistats.clarity.wire.dota.common.proto.DOTACombatLog;
import skadistats.clarity.wire.shared.demo.proto.Demo;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

/**
 * JSON exporter for the local Dota chat app. Args: &lt;replay&gt; &lt;hero-unit-name&gt;.
 * Prints one JSON object to stdout. All timestamps are GAME time (demo clock minus
 * the state=5 offset measured from this same replay; "clockOffsetSec"). Events
 * before game start are labeled "赛前".
 */
public class MatchJsonMain {

    public static void main(String[] args) throws Exception {
        if (args.length != 2) {
            System.err.println("usage: MatchJsonMain <replay> <hero-unit-name>");
            System.exit(2);
        }
        var info = Clarity.infoForFile(args[0]);
        var dota = info.getGameInfo().getDota();
        var c = new Collector(args[1]);
        try (var src = new MappedFileSource(args[0])) {
            new SimpleRunner(src).runWith(c);
        }
        System.out.println(c.toJson(info, dota));
    }

    static String js(String s) {
        if (s == null) {
            return "null";
        }
        return '"' + s.replace("\\", "\\\\").replace("\"", "\\\"")
            .replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t") + '"';
    }

    /** Demo-clock seconds -> game-time label. */
    static String gtime(float t, float off) {
        if (Float.isNaN(t) || t < 0) {
            return "??:??";
        }
        if (t < off) {
            return "赛前";
        }
        int s = (int) (t - off);
        return (s / 60) + ":" + String.format("%02d", s % 60);
    }

    static String pretty(String n) {
        if (n == null) {
            return "?";
        }
        if (n.startsWith("npc_dota_hero_")) {
            return n.substring("npc_dota_hero_".length()).replace('_', ' ');
        }
        return n;
    }

    /** CDOTA_Unit_Hero_LoneDruid -> lone druid */
    static String heroPretty(String n) {
        if (n == null || n.isEmpty()) {
            return "";
        }
        String suffix = n;
        if (suffix.startsWith("CDOTA_Unit_Hero_")) {
            suffix = suffix.substring("CDOTA_Unit_Hero_".length());
        } else if (suffix.startsWith("npc_dota_hero_")) {
            suffix = suffix.substring("npc_dota_hero_".length());
        }
        return suffix.replace('_', ' ')
            .replaceAll("([a-z])([A-Z])", "$1 $2")
            .toLowerCase(Locale.ROOT);
    }

    static String with(CombatLogEntry e) {
        if (e.hasInflictorName() && e.getInflictorName() != null && !e.getInflictorName().isEmpty()) {
            return pretty(e.getInflictorName());
        }
        return "";
    }

    @UsesEntities
    public static class Collector {
        static final int MAIN_SLOTS = 6;
        static final int BACKPACK_SLOTS = 3;
        static final int NEUTRAL_SLOT = 16;
        static final float SERIES_STEP = 5f;
        static final int INVALID_HANDLE = 16777215;

        /** Removals that are not sales: consumables, neutrals, permanent buffs, recipes. */
        static final Set<String> NON_SELL = new HashSet<>(Arrays.asList(
            "item_tpscroll", "item_tango", "item_clarity", "item_flask", "item_faerie_fire",
            "item_enchanted_mango", "item_dust", "item_smoke_of_deceit", "item_ward_observer",
            "item_ward_sentry", "item_ward_dispenser", "item_cheese", "item_refresher_shard",
            "item_moon_shard", "item_famango", "item_great_famango", "item_greater_famango",
            "item_aegis", "item_aghanims_shard", "item_branches", "item_ultimate_scepter",
            "item_ultimate_scepter_2", "item_aghanims_scepter", "item_blood_grenade",
            "item_tome_of_knowledge", "item_roshans_banner", "item_tango_secondary"
        ));

        static final Map<String, String> ITEM_ALIASES = new HashMap<>();
        /**
         * 版本相关的内部类名映射。内部类名可能在版本间复用/改名，
         * 不能把所有版本都套同一个别名；只登记已验证的 build。
         */
        static final Map<Integer, Map<String, String>> ITEM_ALIASES_BY_BUILD = new HashMap<>();

        static {
            versionedAlias(10836, "Guardian_Shell", "item_defiant_shell");
            versionedAlias(10939, "Guardian_Shell", "item_defiant_shell");
        }

        static {
            ITEM_ALIASES.put("MantaStyle", "item_manta");
            ITEM_ALIASES.put("Manta_Style", "item_manta");
            ITEM_ALIASES.put("MaskOfDeath", "item_lifesteal");
            ITEM_ALIASES.put("Mask_Of_Death", "item_lifesteal");
            ITEM_ALIASES.put("BootsOfElven", "item_boots_of_elves");
            ITEM_ALIASES.put("Boots_Of_Elven", "item_boots_of_elves");
            ITEM_ALIASES.put("BootsOfSpeed", "item_boots");
            ITEM_ALIASES.put("Boots_Of_Speed", "item_boots");
            ITEM_ALIASES.put("GlovesOfHaste", "item_gloves");
            ITEM_ALIASES.put("Gloves_Of_Haste", "item_gloves");
            ITEM_ALIASES.put("TeleportScroll", "item_tpscroll");
            ITEM_ALIASES.put("Teleport_Scroll", "item_tpscroll");
            ITEM_ALIASES.put("TownPortalScroll", "item_tpscroll");
            ITEM_ALIASES.put("Town_Portal_Scroll", "item_tpscroll");
            ITEM_ALIASES.put("BlinkDagger", "item_blink");
            ITEM_ALIASES.put("Blink_Dagger", "item_blink");
            ITEM_ALIASES.put("Eaglehorn", "item_eagle");
            ITEM_ALIASES.put("Eagle_Horn", "item_eagle");
            ITEM_ALIASES.put("DivineRapier", "item_rapier");
            ITEM_ALIASES.put("Divine_Rapier", "item_rapier");
            ITEM_ALIASES.put("Aegis", "item_aegis");
            ITEM_ALIASES.put("Cheese", "item_cheese");
            ITEM_ALIASES.put("RefresherShard", "item_refresher_shard");
            ITEM_ALIASES.put("MoonShard", "item_moon_shard");
            ITEM_ALIASES.put("LesserCritical", "item_lesser_crit");
            ITEM_ALIASES.put("Lesser_Critical", "item_lesser_crit");
            ITEM_ALIASES.put("GreaterCritical", "item_greater_crit");
            ITEM_ALIASES.put("Greater_Critical", "item_greater_crit");
            ITEM_ALIASES.put("UltimateScepter", "item_ultimate_scepter");
            ITEM_ALIASES.put("AghanimsScepter", "item_ultimate_scepter");
            ITEM_ALIASES.put("AghanimsShard", "item_aghanims_shard");
            ITEM_ALIASES.put("WardObserver", "item_ward_observer");
            ITEM_ALIASES.put("WardSentry", "item_ward_sentry");
            ITEM_ALIASES.put("WardDispenser", "item_ward_dispenser");
            ITEM_ALIASES.put("DustofAppearance", "item_dust");
            ITEM_ALIASES.put("SmokeofDeceit", "item_smoke_of_deceit");
            ITEM_ALIASES.put("BootsOfTravel", "item_travel_boots");
            ITEM_ALIASES.put("BootsOfTravel2", "item_travel_boots_2");
            ITEM_ALIASES.put("AssaultCuirass", "item_assault");
            ITEM_ALIASES.put("LinkensSphere", "item_sphere");
            ITEM_ALIASES.put("EulsScepterOfDivinity", "item_cyclone");
            ITEM_ALIASES.put("RefresherOrb", "item_refresher");
            ITEM_ALIASES.put("SacredRelic", "item_relic");
            ITEM_ALIASES.put("ScytheOfVyse", "item_sheepstick");
            ITEM_ALIASES.put("IronwoodBranch", "item_branches");
            ITEM_ALIASES.put("ObserverWard", "item_ward_observer");
            ITEM_ALIASES.put("SentryWard", "item_ward_sentry");
            ITEM_ALIASES.put("GhostScepter", "item_ghost");
            ITEM_ALIASES.put("EmptyBottle", "item_bottle");
            ITEM_ALIASES.put("RingOfRegeneration", "item_ring_of_regen");
            ITEM_ALIASES.put("Perseverance", "item_pers");
            ITEM_ALIASES.put("InvisibilityEdge", "item_invis_sword");
            ITEM_ALIASES.put("Battlefury", "item_bfury");
            ITEM_ALIASES.put("GrisGris", "item_grisgris");
            ITEM_ALIASES.put("PlateMail", "item_platemail");
            ITEM_ALIASES.put("RobeOfMagi", "item_robe");
            ITEM_ALIASES.put("GemOfTrueSight", "item_gem");
            ITEM_ALIASES.put("OrchidMalevolence", "item_orchid");
            ITEM_ALIASES.put("CraniumBasher", "item_basher");
            ITEM_ALIASES.put("ChainMail", "item_chainmail");
            ITEM_ALIASES.put("SplintMail", "item_splintmail");
            ITEM_ALIASES.put("ForageHealth", "item_foragers_health");
            ITEM_ALIASES.put("ForagersHealth", "item_foragers_health");
            ITEM_ALIASES.put("ForageMana", "item_foragers_mana");
            ITEM_ALIASES.put("ForageStats", "item_foragers_stats");
            ITEM_ALIASES.put("ForageKit", "item_foragers_kit");
            ITEM_ALIASES.put("SheepStick", "item_sheepstick");
            ITEM_ALIASES.put("Recipe_Battlefury", "item_recipe_bfury");
            ITEM_ALIASES.put("RecipeBattlefury", "item_recipe_bfury");
            ITEM_ALIASES.put("Recipe_Perseverance", "item_recipe_pers");
            ITEM_ALIASES.put("RecipePerseverance", "item_recipe_pers");
            ITEM_ALIASES.put("Recipe_MantaStyle", "item_recipe_manta");
            ITEM_ALIASES.put("Recipe_Yasha", "item_recipe_yasha");
            ITEM_ALIASES.put("Recipe_WraithBand", "item_recipe_wraith_band");
        }

        static {
            ITEM_ALIASES.put("Ironwood_Branch", "item_branches");
            ITEM_ALIASES.put("Observer_Ward", "item_ward_observer");
            ITEM_ALIASES.put("Sentry_Ward", "item_ward_sentry");
            ITEM_ALIASES.put("Ghost_Scepter", "item_ghost");
            ITEM_ALIASES.put("Empty_Bottle", "item_bottle");
            ITEM_ALIASES.put("Ring_Of_Regeneration", "item_ring_of_regen");
            ITEM_ALIASES.put("Invisibility_Edge", "item_invis_sword");
            ITEM_ALIASES.put("Gris_Gris", "item_grisgris");
            ITEM_ALIASES.put("Plate_Mail", "item_platemail");
            ITEM_ALIASES.put("Robe_Of_Magi", "item_robe");
            ITEM_ALIASES.put("Gem_Of_True_Sight", "item_gem");
            ITEM_ALIASES.put("Orchid_Malevolence", "item_orchid");
            ITEM_ALIASES.put("Cranium_Basher", "item_basher");
            ITEM_ALIASES.put("Chain_Mail", "item_chainmail");
            ITEM_ALIASES.put("Splint_Mail", "item_splintmail");
            ITEM_ALIASES.put("Forage_Health", "item_foragers_health");
            ITEM_ALIASES.put("Forage_Mana", "item_foragers_mana");
            ITEM_ALIASES.put("Forage_Stats", "item_foragers_stats");
            ITEM_ALIASES.put("Forage_Kit", "item_foragers_kit");
            ITEM_ALIASES.put("Sheep_Stick", "item_sheepstick");
        }

        static final class ItemSnapshot {
            final float t;
            final String[] main;
            final String neutral;
            final String[] backpack;

            ItemSnapshot(float t, String[] main, String neutral, String[] backpack) {
                this.t = t;
                this.main = main;
                this.neutral = neutral;
                this.backpack = backpack;
            }
        }

        static final class PlayerSeries {
            final int slot;
            String hero = "";
            final List<Integer> netWorth = new ArrayList<>();
            final List<Integer> lastHits = new ArrayList<>();
            final List<Integer> denies = new ArrayList<>();
            final List<Integer> xp = new ArrayList<>();
            final List<Integer> level = new ArrayList<>();
            final List<Integer> kills = new ArrayList<>();
            final List<Integer> deaths = new ArrayList<>();
            final List<Integer> assists = new ArrayList<>();
            final List<Float> heroDamage = new ArrayList<>();
            /** 0–100 百分比，便于跨英雄比较；死亡/未选取时为空。 */
            final List<Integer> hpPct = new ArrayList<>();
            final List<Integer> mpPct = new ArrayList<>();

            PlayerSeries(int slot) {
                this.slot = slot;
            }
        }

        @Insert
        Context ctx;
        @Insert
        Entities entities;

        final String focus;
        float offsetSec = 0f;
        /** Demo-clock offset of entity ticks, measured at the same GAME_STATE=5 event. */
        float entityOffsetSec = Float.NaN;
        boolean offsetOk = false;
        int radiantScore = 0;
        int direScore = 0;
        final Map<String, int[]> kd = new TreeMap<>();
        final Map<String, Long> allDealt = new TreeMap<>();
        final Map<String, Long> allTaken = new TreeMap<>();
        final Map<String, Integer> focusCasts = new TreeMap<>();
        final Map<String, Integer> focusCasts10 = new TreeMap<>();
        /** each: {rawDemoSec, a, b} */
        final List<String[]> focusKills = new ArrayList<>();
        final List<String[]> focusDeaths = new ArrayList<>();
        final List<String[]> focusPurchases = new ArrayList<>();
        /** 主动使用物品的事件（真假眼、吃树、清晰等），用于按队列归属消耗。 */
        final List<String[]> focusUses = new ArrayList<>();
        /** 焦点英雄实际插下的守卫：真眼/假眼类型由守卫单位决定。 */
        final List<String[]> focusWardPlacements = new ArrayList<>();
        /** Real inventory changes read from the focus hero's m_hItems slots. */
        final List<String[]> focusSells = new ArrayList<>();
        final List<String[]> focusRemoved = new ArrayList<>();
        final List<ItemSnapshot> focusItemSnapshots = new ArrayList<>();
        /** Spirit Bear (Lone Druid) inventory, read from its own m_hItems slots. */
        final List<ItemSnapshot> bearItemSnapshots = new ArrayList<>();
        final List<String[]> focusNotes = new ArrayList<>();
        Entity focusHero;
        Entity focusBear;
        String[] lastMain;
        String lastNeutral;
        String[] lastBackpack;
        String[] lastBearMain;
        String lastBearNeutral;
        String[] lastBearBackpack;
        int lastEntityTick = -1;
        final List<Entity> heroEntities = new ArrayList<>();
        final java.util.Set<Integer> heroEntityKeys = new java.util.HashSet<>();
        /** each: {t, playerIndex, cellX, cellY, hp, maxHp, team} */
        final List<String[]> positionSamples = new ArrayList<>();
        float nextPositionAt = 0f;
        final List<PlayerSeries> playerSeries = new ArrayList<>();
        float nextSeriesAt = 0f;
        /** each: {rawDemoSec, radiantAfter, direAfter} */
        final List<float[]> killSnaps = new ArrayList<>();

        Collector(String focus) {
            this.focus = focus;
            for (int i = 0; i < 10; i++) {
                playerSeries.add(new PlayerSeries(i));
            }
        }

        private int[] kdOf(String hero) {
            return kd.computeIfAbsent(hero, k -> new int[2]);
        }

        @OnCombatLogEntry
        public void onEntry(CombatLogEntry e) {
            if (!e.hasType()) {
                return;
            }
            var type = e.getType();
            var attacker = e.hasAttackerName() ? e.getAttackerName() : null;
            var target = e.hasTargetName() ? e.getTargetName() : null;
            float t = e.hasTimestamp() ? e.getTimestamp() : Float.NaN;

            if (type == DOTACombatLog.DOTA_COMBATLOG_TYPES.DOTA_COMBATLOG_GAME_STATE) {
                if (e.hasValue() && e.getValue() == 5 && !Float.isNaN(t) && !offsetOk) {
                    offsetSec = t;
                    offsetOk = true;
                    if (ctx != null) {
                        entityOffsetSec = ctx.getTick() * ctx.getMillisPerTick() / 1000f;
                    }
                }
                return;
            }
            if (type == DOTACombatLog.DOTA_COMBATLOG_TYPES.DOTA_COMBATLOG_DEATH) {
                boolean deny = e.hasTargetSelf() && e.isTargetSelf();
                boolean heroKill = target != null && target.startsWith("npc_dota_hero_")
                    && (!e.hasTargetHero() || e.isTargetHero())
                    && !(e.hasTargetIllusion() && e.isTargetIllusion());
                if (heroKill && !deny) {
                    if (e.hasTargetTeam() && e.getTargetTeam() == 2) {
                        direScore++;
                    } else if (e.hasTargetTeam() && e.getTargetTeam() == 3) {
                        radiantScore++;
                    }
                    if (attacker != null && attacker.startsWith("npc_dota_hero_")) {
                        kdOf(pretty(attacker))[0]++;
                    }
                    kdOf(pretty(target))[1]++;
                    if (!Float.isNaN(t)) {
                        killSnaps.add(new float[]{t, radiantScore, direScore});
                    }
                }
                if (focus.equals(target) && heroKill && !Float.isNaN(t)) {
                    focusDeaths.add(new String[]{Float.toString(t), pretty(attacker), with(e)});
                }
                if (focus.equals(attacker) && heroKill && !deny && !Float.isNaN(t)) {
                    focusKills.add(new String[]{Float.toString(t), pretty(target), with(e)});
                }
                return;
            }
            if (type == DOTACombatLog.DOTA_COMBATLOG_TYPES.DOTA_COMBATLOG_DAMAGE) {
                int v = e.hasValue() ? e.getValue() : 0;
                boolean targetHero = e.hasTargetHero() && e.isTargetHero();
                if (attacker != null && attacker.startsWith("npc_dota_hero_") && targetHero) {
                    allDealt.merge(pretty(attacker), (long) v, Long::sum);
                }
                if (target != null && target.startsWith("npc_dota_hero_")) {
                    allTaken.merge(pretty(target), (long) v, Long::sum);
                }
                return;
            }
            if (type == DOTACombatLog.DOTA_COMBATLOG_TYPES.DOTA_COMBATLOG_ABILITY) {
                var ab = e.hasInflictorName() ? e.getInflictorName() : null;
                if (ab != null && focus.equals(attacker)) {
                    focusCasts.merge(ab, 1, Integer::sum);
                    if (!Float.isNaN(t) && t - offsetSec <= 600f) {
                        focusCasts10.merge(ab, 1, Integer::sum);
                    }
                }
                return;
            }
            if (type == DOTACombatLog.DOTA_COMBATLOG_TYPES.DOTA_COMBATLOG_ITEM) {
                if (focus.equals(attacker) && !Float.isNaN(t)) {
                    String item = e.hasInflictorName() ? e.getInflictorName() : null;
                    if (item == null && e.hasTargetName()) {
                        item = e.getTargetName();
                    }
                    if (item != null) {
                        String targetName = e.hasTargetName() ? e.getTargetName() : "";
                        focusUses.add(new String[]{Float.toString(t), item, targetName == null ? "" : targetName});
                    }
                }
                return;
            }
            if (type == DOTACombatLog.DOTA_COMBATLOG_TYPES.DOTA_COMBATLOG_PURCHASE) {
                if ((focus.equals(attacker) || focus.equals(target)) && !Float.isNaN(t)) {
                    String item = e.hasValue() ? e.getValueName() : null;
                    if (item == null && e.hasInflictorName()) {
                        item = e.getInflictorName();
                    }
                    if (item == null) {
                        item = target;
                    }
                    focusPurchases.add(new String[]{Float.toString(t), item == null ? "?" : item, ""});
                }
                return;
            }
            if (type == DOTACombatLog.DOTA_COMBATLOG_TYPES.DOTA_COMBATLOG_MULTIKILL) {
                if (focus.equals(attacker) && !Float.isNaN(t)) {
                    focusNotes.add(new String[]{Float.toString(t),
                        "multikill x" + (e.hasValue() ? e.getValue() : 0), ""});
                }
                return;
            }
            if (type == DOTACombatLog.DOTA_COMBATLOG_TYPES.DOTA_COMBATLOG_FIRST_BLOOD) {
                if ((focus.equals(attacker) || focus.equals(target)) && !Float.isNaN(t)) {
                    focusNotes.add(new String[]{Float.toString(t),
                        "first blood: " + pretty(attacker) + " -> " + pretty(target), ""});
                }
            }
        }

        @OnEntityCreated(classPattern = "CDOTA_Unit_Hero_.*")
        public void onHeroCreated(Entity e) {
            if (heroEntityKeys.add(e.getIndex())) {
                heroEntities.add(e);
            }
            if (focusHero == null || !focusHero.isExistent()) {
                if (heroMatches(e)) {
                    focusHero = e;
                }
            }
        }

        @OnEntityCreated(classPattern = "CDOTA_Unit_.*(SpiritBear|LoneDruidBear).*")
        public void onBearCreated(Entity e) {
            if (!e.getDtClass().getDtName().startsWith("CDOTA_Unit_")) {
                return;
            }
            if (focusBear == null || !focusBear.isExistent()) {
                focusBear = e;
            }
        }

        @OnEntityCreated(classPattern = "CDOTA_NPC_Observer_Ward.*")
        public void onWardCreated(Entity e) {
            try {
                if (ctx == null || focusHero == null) {
                    return;
                }
                Integer focusTeam = intProp(focusHero, "m_iTeamNum");
                Integer team = intProp(e, "m_iTeamNum");
                if (focusTeam == null || team == null || !focusTeam.equals(team)) {
                    return;
                }
                String cls = e.getDtClass().getDtName();
                // 普通观察者守卫 / TrueSight 变体（哨兵守卫）
                String type = cls.endsWith("TrueSight") ? "item_ward_sentry" : "item_ward_observer";
                float t = ctx.getTick() * ctx.getMillisPerTick() / 1000f
                    - (Float.isNaN(entityOffsetSec) ? offsetSec : entityOffsetSec);
                Integer cellX = intProp(e, "CBodyComponent.m_cellX");
                Integer cellY = intProp(e, "CBodyComponent.m_cellY");
                String pos = (cellX == null || cellY == null) ? "" : (cellX + "," + cellY);
                focusWardPlacements.add(new String[]{Float.toString(Math.max(0f, t)), type, pos});
            } catch (Throwable ignored) {
            }
        }

        private boolean heroMatches(Entity e) {
            String cls = e.getDtClass().getDtName();
            if (!cls.startsWith("CDOTA_Unit_Hero_")) {
                return false;
            }
            String suffix = cls.substring("CDOTA_Unit_Hero_".length()).replace("_", "");
            String unit = focus.startsWith("npc_dota_hero_")
                ? focus.substring("npc_dota_hero_".length()) : focus;
            return suffix.equalsIgnoreCase(unit.replace("_", ""));
        }

        @OnEntityUpdatesCompleted
        public void onEntityUpdatesCompleted() {
            if (focusHero == null || !focusHero.isExistent() || ctx == null || Float.isNaN(entityOffsetSec)) {
                return;
            }
            int tick = ctx.getTick();
            if (tick == lastEntityTick) {
                return;
            }
            lastEntityTick = tick;
            float t = Math.max(0f, tick * ctx.getMillisPerTick() / 1000f - entityOffsetSec);

            if (t >= nextPositionAt) {
                for (Entity hero : heroEntities) {
                    if (!hero.isExistent()) {
                        continue;
                    }
                    int pid;
                    try {
                        pid = hero.hasProperty("m_iPlayerID")
                            ? ((Number) hero.getProperty("m_iPlayerID")).intValue() : -1;
                    } catch (Exception ex) {
                        continue;
                    }
                    if (pid < 0 || pid > 9) {
                        continue;
                    }
                    try {
                        int x = ((Number) hero.getProperty("CBodyComponent.m_cellX")).intValue();
                        int y = ((Number) hero.getProperty("CBodyComponent.m_cellY")).intValue();
                        int hp = hero.hasProperty("m_iHealth")
                            ? ((Number) hero.getProperty("m_iHealth")).intValue() : 0;
                        int maxHp = hero.hasProperty("m_iMaxHealth")
                            ? ((Number) hero.getProperty("m_iMaxHealth")).intValue() : 0;
                        int team = hero.hasProperty("m_iTeamNum")
                            ? ((Number) hero.getProperty("m_iTeamNum")).intValue() : 0;
                        positionSamples.add(new String[]{
                            String.format(java.util.Locale.ROOT, "%.1f", t),
                            Integer.toString(pid), Integer.toString(x), Integer.toString(y),
                            Integer.toString(hp), Integer.toString(maxHp), Integer.toString(team)
                        });
                    } catch (Exception ex) {
                        /* 英雄还没生成位置 */
                    }
                }
                nextPositionAt = (float) (Math.floor(t / 5f) + 1) * 5f;
            }

            String[] main = new String[MAIN_SLOTS];
            String[] backpack = new String[BACKPACK_SLOTS];
            for (int i = 0; i < MAIN_SLOTS; i++) {
                main[i] = readItem(focusHero, i);
            }
            for (int i = 0; i < BACKPACK_SLOTS; i++) {
                backpack[i] = readItem(focusHero, MAIN_SLOTS + i);
            }
            String neutral = readItem(focusHero, NEUTRAL_SLOT);

            if (lastMain == null) {
                lastMain = main;
                lastBackpack = backpack;
                lastNeutral = neutral;
                addItemSnapshot(t, main, neutral, backpack);
            } else if (!sameInventory(lastMain, lastNeutral, lastBackpack, main, neutral, backpack)) {
                addItemSnapshot(t, main, neutral, backpack);
                List<String> before = inventoryKeys(lastMain, lastNeutral, lastBackpack);
                List<String> after = inventoryKeys(main, neutral, backpack);
                List<String> added = new ArrayList<>(after);
                for (String s : before) {
                    added.remove(s);
                }
                List<String> removed = new ArrayList<>(before);
                for (String s : after) {
                    removed.remove(s);
                }
                if (!removed.isEmpty()) {
                    String addedKeys = String.join(",", added);
                    for (String key : removed) {
                        boolean toBear = bearHasItem(key);
                        String removedWith = toBear
                            ? (addedKeys.isEmpty() ? "bear" : addedKeys + ",bear")
                            : addedKeys;
                        focusRemoved.add(eventRow(t, key, removedWith));
                        if (added.isEmpty() && !isNonSell(key) && !toBear) {
                            focusSells.add(eventRow(t, key, ""));
                        }
                    }
                }
                lastMain = main;
                lastBackpack = backpack;
                lastNeutral = neutral;
            }

            if (focusBear != null && focusBear.isExistent()) {
                String[] bearMain = new String[MAIN_SLOTS];
                String[] bearBackpack = new String[BACKPACK_SLOTS];
                for (int i = 0; i < MAIN_SLOTS; i++) {
                    bearMain[i] = readItem(focusBear, i);
                }
                for (int i = 0; i < BACKPACK_SLOTS; i++) {
                    bearBackpack[i] = readItem(focusBear, MAIN_SLOTS + i);
                }
                String bearNeutral = readItem(focusBear, NEUTRAL_SLOT);
                if (lastBearMain == null) {
                    lastBearMain = bearMain;
                    lastBearBackpack = bearBackpack;
                    lastBearNeutral = bearNeutral;
                    addBearSnapshot(t, bearMain, bearNeutral, bearBackpack);
                } else if (!sameInventory(lastBearMain, lastBearNeutral, lastBearBackpack,
                        bearMain, bearNeutral, bearBackpack)) {
                    addBearSnapshot(t, bearMain, bearNeutral, bearBackpack);
                    lastBearMain = bearMain;
                    lastBearBackpack = bearBackpack;
                    lastBearNeutral = bearNeutral;
                }
            }

            if (t >= nextSeriesAt) {
                sampleSeries(t);
                nextSeriesAt = (float) (Math.floor(t / SERIES_STEP) + 1) * SERIES_STEP;
            }
        }

        private String readItem(Entity unit, int slot) {
            String path = "m_hItems." + String.format("%04d", slot);
            if (!unit.hasProperty(path)) {
                return null;
            }
            Object raw = unit.getProperty(path);
            int handle = raw instanceof Number ? ((Number) raw).intValue() : -1;
            if (handle <= 0 || handle == INVALID_HANDLE) {
                return null;
            }
            Entity item = entities.getByHandle(handle);
            return item == null ? null : itemKey(item.getDtClass().getDtName(), ctx.getBuildNumber());
        }

        private void addBearSnapshot(float t, String[] main, String neutral, String[] backpack) {
            if (!bearItemSnapshots.isEmpty()) {
                ItemSnapshot last = bearItemSnapshots.get(bearItemSnapshots.size() - 1);
                if (Math.abs(last.t - t) < 0.5f
                    && Arrays.equals(last.main, main)
                    && equalsNullable(last.neutral, neutral)
                    && Arrays.equals(last.backpack, backpack)) {
                    return;
                }
            }
            bearItemSnapshots.add(new ItemSnapshot(t, main.clone(), neutral, backpack.clone()));
        }

        private void addItemSnapshot(float t, String[] main, String neutral, String[] backpack) {
            if (!focusItemSnapshots.isEmpty()) {
                ItemSnapshot last = focusItemSnapshots.get(focusItemSnapshots.size() - 1);
                if (Math.abs(last.t - t) < 0.5f
                    && Arrays.equals(last.main, main)
                    && equalsNullable(last.neutral, neutral)
                    && Arrays.equals(last.backpack, backpack)) {
                    return;
                }
            }
            focusItemSnapshots.add(new ItemSnapshot(t, main.clone(), neutral, backpack.clone()));
        }

        private static boolean equalsNullable(String a, String b) {
            return a == null ? b == null : a.equals(b);
        }

        private static boolean sameInventory(String[] mainA, String neutralA, String[] backpackA,
                                             String[] mainB, String neutralB, String[] backpackB) {
            return Arrays.equals(mainA, mainB)
                && equalsNullable(neutralA, neutralB)
                && Arrays.equals(backpackA, backpackB);
        }

        private static List<String> inventoryKeys(String[] main, String neutral, String[] backpack) {
            List<String> out = new ArrayList<>();
            for (String key : main) {
                if (key != null && !key.isEmpty()) {
                    out.add(key);
                }
            }
            if (neutral != null && !neutral.isEmpty()) {
                out.add(neutral);
            }
            for (String key : backpack) {
                if (key != null && !key.isEmpty()) {
                    out.add(key);
                }
            }
            return out;
        }

        // --- 5 秒采样：录像里的实时经济/补刀/经验/伤害/等级/KDA ---
        private void sampleSeries(float t) {
            Entity pr = findEntity("CDOTA_PlayerResource");
            Entity radiant = findEntity("CDOTA_DataRadiant");
            Entity dire = findEntity("CDOTA_DataDire");
            for (PlayerSeries series : playerSeries) {
                int slot = series.slot;
                Entity data = slot < 5 ? radiant : dire;
                int teamSlot = slot < 5 ? slot : slot - 5;
                String prBase = "m_vecPlayerTeamData." + String.format("%04d", slot) + ".";
                String dataBase = "m_vecDataTeam." + String.format("%04d", teamSlot) + ".";

                Entity heroEntity = selectedHeroEntity(pr, slot);
                if (heroEntity != null) {
                    series.hero = heroEntity.getDtClass().getDtName();
                }
                Integer level = intProp(heroEntity, "m_iCurrentLevel");
                if (level == null) {
                    level = intProp(pr, prBase + "m_iLevel");
                }
                Integer xp = intProp(heroEntity, "m_iCurrentXP");
                if (xp == null) {
                    xp = intProp(data, dataBase + "m_iTotalEarnedXP");
                }

                series.kills.add(intProp(pr, prBase + "m_iKills"));
                series.deaths.add(intProp(pr, prBase + "m_iDeaths"));
                series.assists.add(intProp(pr, prBase + "m_iAssists"));
                series.level.add(level);
                series.netWorth.add(intProp(data, dataBase + "m_iNetWorth"));
                series.lastHits.add(intProp(data, dataBase + "m_iLastHitCount"));
                series.denies.add(intProp(data, dataBase + "m_iDenyCount"));
                series.xp.add(xp);
                series.heroDamage.add(floatProp(data, dataBase + "m_flHeroDamage"));
                series.hpPct.add(percent(intProp(heroEntity, "m_iHealth"), intProp(heroEntity, "m_iMaxHealth")));
                series.mpPct.add(percent(floatProp(heroEntity, "m_flMana"), floatProp(heroEntity, "m_flMaxMana")));
            }
        }

        private static Integer percent(Number value, Number max) {
            if (value == null || max == null) {
                return null;
            }
            float m = max.floatValue();
            if (m <= 0f) {
                return null;
            }
            return Math.round(Math.max(0f, Math.min(1f, value.floatValue() / m)) * 100f);
        }

        private Entity findEntity(String dtName) {
            return entities.stream()
                .filter(e -> e.isExistent() && dtName.equals(e.getDtClass().getDtName()))
                .findFirst()
                .orElse(null);
        }

        private Entity selectedHeroEntity(Entity pr, int slot) {
            if (pr == null) {
                return null;
            }
            String path = "m_vecPlayerTeamData." + String.format("%04d", slot) + ".m_hSelectedHero";
            if (!pr.hasProperty(path)) {
                return null;
            }
            Object raw = pr.getProperty(path);
            int handle = raw instanceof Number ? ((Number) raw).intValue() : -1;
            if (handle <= 0 || handle == INVALID_HANDLE) {
                return null;
            }
            return entities.getByHandle(handle);
        }

        private static Integer intProp(Entity e, String path) {
            if (e == null || !e.hasProperty(path)) {
                return null;
            }
            try {
                Object value = e.getProperty(path);
                return value instanceof Number ? ((Number) value).intValue() : null;
            } catch (Throwable ignored) {
                return null;
            }
        }

        private static Float floatProp(Entity e, String path) {
            if (e == null || !e.hasProperty(path)) {
                return null;
            }
            try {
                Object value = e.getProperty(path);
                return value instanceof Number ? ((Number) value).floatValue() : null;
            } catch (Throwable ignored) {
                return null;
            }
        }

        private static int lastInt(List<Integer> values) {
            return values == null || values.isEmpty() ? 0 : values.get(values.size() - 1);
        }

        private static float lastFloat(List<Float> values) {
            return values == null || values.isEmpty() ? 0f : values.get(values.size() - 1);
        }

        private String[] eventRow(float gameT, String key, String extra) {
            return new String[]{Float.toString(gameT + offsetSec), key == null ? "?" : key, extra};
        }

        private static List<String> nonEmpty(String[] slots) {
            List<String> out = new ArrayList<>();
            for (String slot : slots) {
                if (slot != null && !slot.isEmpty()) {
                    out.add(slot);
                }
            }
            return out;
        }

        private boolean bearHasItem(String key) {
            if (focusBear == null || !focusBear.isExistent() || key == null) {
                return false;
            }
            for (int i = 0; i < MAIN_SLOTS; i++) {
                if (key.equals(readItem(focusBear, i))) {
                    return true;
                }
            }
            for (int i = 0; i < BACKPACK_SLOTS; i++) {
                if (key.equals(readItem(focusBear, MAIN_SLOTS + i))) {
                    return true;
                }
            }
            return key.equals(readItem(focusBear, NEUTRAL_SLOT));
        }

        private static boolean isNonSell(String key) {
            return key == null || key.startsWith("item_recipe_")
                || key.startsWith("item_enhancement") || NON_SELL.contains(key);
        }

        static void versionedAlias(int build, String className, String key) {
            ITEM_ALIASES_BY_BUILD.computeIfAbsent(build, ignored -> new HashMap<>())
                .put(className, key);
        }

        static String itemKey(String dtName, int build) {
            if (dtName == null || !dtName.startsWith("CDOTA_Item_")) {
                return null;
            }
            String suffix = dtName.substring("CDOTA_Item_".length());
            Map<String, String> versioned = ITEM_ALIASES_BY_BUILD.get(build);
            String alias = versioned == null ? null : versioned.get(suffix);
            if (alias == null) {
                alias = ITEM_ALIASES.get(suffix);
            }
            if (alias != null) {
                return alias;
            }
            if (suffix.startsWith("Recipe_")) {
                return "item_recipe_" + snake(suffix.substring("Recipe_".length()));
            }
            return "item_" + snake(suffix);
        }

        private static String snake(String value) {
            StringBuilder out = new StringBuilder();
            for (int i = 0; i < value.length(); i++) {
                char c = value.charAt(i);
                if (c == '_') {
                    if (out.length() > 0 && out.charAt(out.length() - 1) != '_') {
                        out.append('_');
                    }
                    continue;
                }
                if (Character.isUpperCase(c)) {
                    boolean boundary = out.length() > 0 && out.charAt(out.length() - 1) != '_'
                        && (i == 0 || !Character.isUpperCase(value.charAt(i - 1))
                            || (i + 1 < value.length() && Character.isLowerCase(value.charAt(i + 1))));
                    if (boundary) {
                        out.append('_');
                    }
                    out.append(Character.toLowerCase(c));
                } else {
                    out.append(c);
                }
            }
            String result = out.toString().replaceAll("_+", "_");
            if (result.startsWith("_")) {
                result = result.substring(1);
            }
            if (result.endsWith("_")) {
                result = result.substring(0, result.length() - 1);
            }
            return result;
        }

        String toJson(Demo.CDemoFileInfo info, Demo.CGameInfo.CDotaGameInfo dota) {
            var sb = new StringBuilder();
            sb.append('{');
            sb.append("\"schema\":8,");
            sb.append("\"build\":").append(ctx.getBuildNumber()).append(',');
            sb.append("\"gameVersion\":").append(ctx.getGameVersion()).append(',');
            sb.append("\"matchId\":").append(dota.getMatchId()).append(',');
            sb.append("\"winner\":").append(dota.getGameWinner()).append(',');
            sb.append("\"mode\":").append(dota.getGameMode()).append(',');
            sb.append("\"playbackSec\":").append((long) info.getPlaybackTime()).append(',');
            sb.append("\"clockOffsetSec\":").append((long) offsetSec).append(',');
            sb.append("\"clockCalibrated\":").append(offsetOk).append(',');
            sb.append("\"players\":[");
            boolean first = true;
            int playerIndex = 0;
            for (var p : dota.getPlayerInfoList()) {
                if (!first) {
                    sb.append(',');
                }
                first = false;
                sb.append("{\"team\":").append(p.getGameTeam())
                    .append(",\"slot\":").append(playerIndex++)
                    .append(",\"name\":").append(js(p.hasPlayerName() ? p.getPlayerName() : "?"))
                    .append(",\"hero\":").append(js(p.hasHeroName() ? p.getHeroName() : "?"))
                    .append('}');
            }
            sb.append("],\"scoreboard\":[");
            first = true;
            for (PlayerSeries series : playerSeries) {
                if (series.hero == null || series.hero.isEmpty()) {
                    continue;
                }
                if (!first) {
                    sb.append(',');
                }
                first = false;
                sb.append("{\"hero\":").append(js(heroPretty(series.hero)))
                    .append(",\"k\":").append(lastInt(series.kills))
                    .append(",\"d\":").append(lastInt(series.deaths))
                    .append(",\"a\":").append(lastInt(series.assists)).append('}');
            }
            sb.append("],\"damageDealt\":[");
            first = true;
            for (PlayerSeries series : playerSeries) {
                if (series.hero == null || series.hero.isEmpty() || series.heroDamage.isEmpty()) {
                    continue;
                }
                if (!first) {
                    sb.append(',');
                }
                first = false;
                sb.append("{\"hero\":").append(js(heroPretty(series.hero)))
                    .append(",\"v\":").append(Math.round(lastFloat(series.heroDamage))).append('}');
            }
            sb.append(']');
            sb.append(",\"damageTaken\":").append(mapJson(allTaken));
            sb.append(",\"timeline\":[");
            first = true;
            for (var s : killSnaps) {
                if (!first) {
                    sb.append(',');
                }
                first = false;
                sb.append("{\"t\":").append(js(gtime(s[0], offsetSec)))
                    .append(",\"radiant\":").append((int) s[1])
                    .append(",\"dire\":").append((int) s[2]).append('}');
            }
            sb.append(']');
            sb.append(",\"final\":{\"radiant\":").append(radiantScore)
                .append(",\"dire\":").append(direScore).append('}');
            sb.append(",\"positions\":{");
            sb.append("\"step\":5,\"samples\":[");
            for (int i = 0; i < positionSamples.size(); i++) {
                String[] row = positionSamples.get(i);
                if (i > 0) sb.append(',');
                sb.append('[').append(row[0]).append(',').append(row[1]).append(',')
                    .append(row[2]).append(',').append(row[3]).append(',')
                    .append(row[4]).append(',').append(row[5]).append(',').append(row[6]).append(']');
            }
            sb.append("]}");
            sb.append(",\"series\":");
            appendSeries(sb);
            sb.append(",\"focus\":{\"unit\":").append(js(focus));
            sb.append(",\"kills\":").append(tripJson(focusKills));
            sb.append(",\"deaths\":").append(tripJson(focusDeaths));
            sb.append(",\"purchases\":").append(tripJson(focusPurchases));
            sb.append(",\"uses\":").append(tripJson(focusUses));
            sb.append(",\"wardPlacements\":").append(tripJson(focusWardPlacements));
            sb.append(",\"items\":");
            appendItemSnapshots(sb);
            sb.append(",\"bearItems\":");
            appendItemSnapshots(sb, bearItemSnapshots);
            sb.append(",\"sells\":").append(tripJson(focusSells));
            sb.append(",\"removed\":").append(tripJson(focusRemoved));
            sb.append(",\"notes\":").append(tripJson(focusNotes));
            sb.append(",\"casts\":").append(mapJsonI(focusCasts));
            sb.append(",\"casts10\":").append(mapJsonI(focusCasts10));
            sb.append("}}");
            return sb.toString();
        }

        void appendItemSnapshots(StringBuilder sb) {
            appendItemSnapshots(sb, focusItemSnapshots);
        }

        void appendItemSnapshots(StringBuilder sb, List<ItemSnapshot> snapshots) {
            sb.append('[');
            for (int i = 0; i < snapshots.size(); i++) {
                ItemSnapshot snapshot = snapshots.get(i);
                if (i > 0) {
                    sb.append(',');
                }
                sb.append("{\"t\":").append(js(gtime(snapshot.t, 0f))).append(",\"main\":[");
                for (int j = 0; j < snapshot.main.length; j++) {
                    if (j > 0) {
                        sb.append(',');
                    }
                    sb.append(js(snapshot.main[j] == null ? "" : snapshot.main[j]));
                }
                sb.append("],\"neutral\":").append(js(snapshot.neutral == null ? "" : snapshot.neutral));
                sb.append(",\"backpack\":[");
                for (int j = 0; j < snapshot.backpack.length; j++) {
                    if (j > 0) {
                        sb.append(',');
                    }
                    sb.append(js(snapshot.backpack[j] == null ? "" : snapshot.backpack[j]));
                }
                sb.append("]}");
            }
            sb.append(']');
        }

        void appendSeries(StringBuilder sb) {
            sb.append("{\"step\":").append((int) SERIES_STEP).append(",\"players\":[");
            for (int i = 0; i < playerSeries.size(); i++) {
                PlayerSeries series = playerSeries.get(i);
                if (i > 0) {
                    sb.append(',');
                }
                sb.append("{\"slot\":").append(series.slot)
                    .append(",\"hero\":").append(js(series.hero));
                sb.append(",\"netWorth\":");
                appendInts(sb, series.netWorth);
                sb.append(",\"lastHits\":");
                appendInts(sb, series.lastHits);
                sb.append(",\"denies\":");
                appendInts(sb, series.denies);
                sb.append(",\"xp\":");
                appendInts(sb, series.xp);
                sb.append(",\"level\":");
                appendInts(sb, series.level);
                sb.append(",\"kills\":");
                appendInts(sb, series.kills);
                sb.append(",\"deaths\":");
                appendInts(sb, series.deaths);
                sb.append(",\"assists\":");
                appendInts(sb, series.assists);
                sb.append(",\"heroDamage\":");
                appendFloats(sb, series.heroDamage);
                sb.append(",\"hp\":");
                appendInts(sb, series.hpPct);
                sb.append(",\"mp\":");
                appendInts(sb, series.mpPct);
                sb.append('}');
            }
            sb.append("]}");
        }

        static void appendInts(StringBuilder sb, List<Integer> values) {
            sb.append('[');
            for (int i = 0; i < values.size(); i++) {
                if (i > 0) {
                    sb.append(',');
                }
                Integer value = values.get(i);
                sb.append(value == null ? "null" : value.toString());
            }
            sb.append(']');
        }

        static void appendFloats(StringBuilder sb, List<Float> values) {
            sb.append('[');
            for (int i = 0; i < values.size(); i++) {
                if (i > 0) {
                    sb.append(',');
                }
                Float value = values.get(i);
                sb.append(value == null || value.isNaN() || value.isInfinite() ? "null" : value.toString());
            }
            sb.append(']');
        }

        String tripJson(List<String[]> rows) {
            var sb = new StringBuilder("[");
            boolean first = true;
            for (var r : rows) {
                if (!first) {
                    sb.append(',');
                }
                first = false;
                float raw;
                try {
                    raw = Float.parseFloat(r[0]);
                } catch (NumberFormatException ex) {
                    raw = Float.NaN;
                }
                sb.append("{\"t\":").append(js(gtime(raw, offsetSec)))
                    .append(",\"a\":").append(js(r[1]))
                    .append(",\"b\":").append(js(r[2])).append('}');
            }
            return sb.append(']').toString();
        }

        static String mapJson(Map<String, Long> m) {
            var sb = new StringBuilder("[");
            boolean first = true;
            for (var k : m.keySet()) {
                if (!first) {
                    sb.append(',');
                }
                first = false;
                sb.append("{\"hero\":").append(js(k)).append(",\"v\":").append(m.get(k)).append('}');
            }
            return sb.append(']').toString();
        }

        static String mapJsonI(Map<String, Integer> m) {
            var sb = new StringBuilder("[");
            boolean first = true;
            for (var k : m.keySet()) {
                if (!first) {
                    sb.append(',');
                }
                first = false;
                sb.append("{\"ability\":").append(js(k)).append(",\"n\":").append(m.get(k)).append('}');
            }
            return sb.append(']').toString();
        }
    }
}
