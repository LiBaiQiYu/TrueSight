"""把 chart.js 及其依赖装进 ui/node_modules（不走包管理器，避免重排现有 node_modules）。"""
import json
import os
import shutil
import tarfile
import tempfile
import urllib.request

REGISTRY = 'https://registry.npmjs.org'
UA = {'User-Agent': 'TrueSight/0.1'}


def meta(name):
    url = '%s/%s' % (REGISTRY, name.replace('/', '%2f'))
    req = urllib.request.Request(url, headers=UA)
    return json.loads(urllib.request.urlopen(req, timeout=60).read())


def install(name, version, target_root):
    data = meta(name)
    if version is None:
        version = data['dist-tags']['latest']
    tarball = data['versions'][version]['dist']['tarball']
    print('install', name, version)
    req = urllib.request.Request(tarball, headers=UA)
    raw = urllib.request.urlopen(req, timeout=120).read()
    with tempfile.TemporaryDirectory() as tmp:
        path = os.path.join(tmp, 'pkg.tgz')
        open(path, 'wb').write(raw)
        with tarfile.open(path) as tar:
            tar.extractall(tmp)
        src = os.path.join(tmp, 'package')
        dest = os.path.join(target_root, name)
        if os.path.isdir(dest):
            shutil.rmtree(dest)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        shutil.copytree(src, dest)
    return version


def main():
    root = os.path.join('ui', 'node_modules')
    chart_version = install('chart.js', '4.6.1', root)
    install('@kurkle/color', '0.3.4', root)
    color_version = '0.3.4'

    pkg_path = os.path.join('ui', 'package.json')
    with open(pkg_path, encoding='utf-8') as f:
        pkg = json.load(f)
    pkg.setdefault('dependencies', {})['chart.js'] = '^%s' % chart_version
    with open(pkg_path, 'w', encoding='utf-8') as f:
        json.dump(pkg, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print('package.json updated: chart.js ^%s, @kurkle/color %s' % (chart_version, color_version))


if __name__ == '__main__':
    main()
