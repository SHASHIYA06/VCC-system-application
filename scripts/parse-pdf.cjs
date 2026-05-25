const pdfParse = require('pdf-parse');
const fs = require('fs');

async function main() {
  const filePath = process.argv[2];
  const dataBuffer = fs.readFileSync(filePath);
  const pdfFn = typeof pdfParse === 'function' ? pdfParse : pdfParse.default;
  const data = await pdfFn(dataBuffer);
  console.log(JSON.stringify({ text: data.text, numpages: data.numpages }));
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
