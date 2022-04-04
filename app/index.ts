const http = require('http');
const youtubedl = require('youtube-dl-exec');

// const subProcess = youtubedl.exec('https://www.youtube.com/watch?v=ZkdpxiphOPA', {
//   dumpSingleJson: true,
//   noWarnings: true,
//   noCallHome: true,
//   noCheckCertificate: true,
//   preferFreeFormats: true,
//   youtubeSkipDashManifest: true,
//   referer: 'https://www.youtube.com'
// })

// subProcess.stdout.on('data', data => {
//   console.log(data)
// })

youtubedl('https://www.youtube.com/user/raviramamoorthi/playlists', {
  dumpSingleJson: true,
  noWarnings: true,
  noCallHome: true,
  noCheckCertificate: true,
  preferFreeFormats: true,
  youtubeSkipDashManifest: true,
  referer: 'https://www.youtube.com'
})
  .then(output => console.log(output))

// http.createServer((request, response) => {

//   response.writeHead(200, { 'Content-Type': 'text/plain' });

//   response.end('Hello World\n');
// }).listen(3000);