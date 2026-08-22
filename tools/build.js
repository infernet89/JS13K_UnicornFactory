const fs = require('fs'), path = require('path'), cp = require('child_process');
const terser = require('terser');
const htmlmin = require('html-minifier-terser');

const R = p => path.join(__dirname, '..', p);
const SEVEN = 'C:/Program Files/7-Zip/7z.exe';

const zip = (name, html) => {
  const dir = R('dist');
  const tmp = path.join(dir, '_' + name);
  fs.mkdirSync(tmp, { recursive: true });
  fs.writeFileSync(path.join(tmp, 'index.html'), html);
  const out = path.join(dir, name + '.zip');
  if (fs.existsSync(out)) fs.unlinkSync(out);
  cp.execFileSync(SEVEN, ['a', '-tzip', '-mx=9', '-mfb=258', '-mpass=15', '-bso0', '-bsp0', out, path.join(tmp, 'index.html')]);
  return fs.statSync(out).size;
};

(async () => {
  const shell = fs.readFileSync(R('src/index.html'), 'utf8');
  const files = [...shell.matchAll(/<script src="([^"]+)"><\/script>\s*/g)];
  const src = files.map(m => fs.readFileSync(R('src/' + m[1]), 'utf8')).join('\n');
  const raw = shell.replace(/<script src="[^"]+"><\/script>\s*/g, '');

  const min = await terser.minify('(()=>{\n' + src + '\n})()', {
    ecma: 2020, toplevel: true,
    compress: { passes: 4, unsafe: true, unsafe_arrows: true, unsafe_math: true, unsafe_methods: true, booleans_as_integers: true, drop_console: true, pure_getters: true, hoist_funs: true },
    mangle: { toplevel: true },
    format: { comments: false }
  });
  if (min.error) throw min.error;
  const js = min.code;
  console.log('js minified:', js.length, 'bytes');

  const build = async code => {
    const h = raw.replace('</body>', '<script>' + code.replace(/<\/script/gi, '<\\/script') + '</script></body>');
    return htmlmin.minify(h, {
      collapseWhitespace: true, removeComments: true, removeAttributeQuotes: true,
      removeOptionalTags: true, minifyCSS: true, useShortDoctype: true, collapseBooleanAttributes: true
    });
  };

  const plain = await build(js);
  fs.mkdirSync(R('dist'), { recursive: true });
  fs.writeFileSync(R('dist/index.html'), plain);
  const sPlain = zip('plain', plain);

  let best = { n: 'plain', s: sPlain, html: plain };
  if (!process.argv.includes('--fast')) {
    const { Packer } = await import('roadroller');
    const packer = new Packer([{ data: js, type: 'js', action: 'eval' }], { maxMemoryMB: 300 });
    await packer.optimize(1);
    const { firstLine, secondLine } = packer.makeDecoder();
    const rolled = await build(firstLine + secondLine);
    const sRoll = zip('rolled', rolled);
    console.log('roadroller zip:', sRoll);
    if (sRoll < best.s) best = { n: 'rolled', s: sRoll, html: rolled };
  }

  fs.copyFileSync(R('dist/' + best.n + '.zip'), R('dist/game.zip'));
  fs.writeFileSync(R('dist/index.html'), best.html);
  const pct = (best.s / 13312 * 100).toFixed(1);
  console.log('----');
  console.log('winner: ' + best.n + '   zip: ' + best.s + ' / 13312 bytes  (' + pct + '%)  left: ' + (13312 - best.s));
})();
