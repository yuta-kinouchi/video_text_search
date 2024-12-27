// scripts/format-credentials.js
const fs = require('fs');

try {
  // key.jsonを読み込む
  const jsonContent = fs.readFileSync('key.json', 'utf8');

  // JSONとしてパースして再度文字列化
  const cleanJson = JSON.stringify(JSON.parse(jsonContent));

  // 環境変数形式で出力
  console.log(`GOOGLE_CLOUD_CREDENTIALS=${cleanJson}`);
} catch (error) {
  console.error('Error:', error);
}