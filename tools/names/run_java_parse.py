import subprocess
import os

root = os.path.abspath('.')
java = os.path.join(root, 'jre', 'bin', 'java.exe')
args = [
    java,
    '-Dfile.encoding=UTF-8',
    '-Dstdout.encoding=UTF-8',
    '-Djava.io.tmpdir=' + os.path.join(root, '.cache', 'tmp'),
    '-Dorg.xerial.snappy.tempdir=' + os.path.join(root, '.cache', 'snappy'),
    '-cp', os.pathsep.join([os.path.join(root, 'classes'), os.path.join(root, 'lib', '*')]),
    'skadistats.clarity.bench.MatchJsonMain',
    os.path.join(root, 'replays', '9074689290.dem'),
    'npc_dota_hero_lone_druid',
]
proc = subprocess.run(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=600)
print('exit', proc.returncode)
open('.cache/bear-debug.err', 'wb').write(proc.stderr)
open('.cache/lone_druid_raw.json', 'wb').write(proc.stdout)
print('stdout bytes', len(proc.stdout), 'stderr bytes', len(proc.stderr))
