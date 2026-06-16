
const fs = require('fs');
const path = require('path');

const pluginsPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'assets', 'capacitor.plugins.json');

const plugins = [
  {
    "pkg": "@capacitor/filesystem",
    "classpath": "com.capacitorjs.plugins.filesystem.FilesystemPlugin"
  },
  {
    "pkg": "com.peredoro.swipegalery",
    "classpath": "com.peredoro.swipegalery.MediaScannerPlugin"
  }
];

fs.writeFileSync(pluginsPath, JSON.stringify(plugins, null, 2));
console.log('✅ capacitor.plugins.json atualizado com MediaScannerPlugin');