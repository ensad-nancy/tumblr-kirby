const fs = require('fs');
const glob = require('glob');
const cheerio = require('cheerio');
const download = require('download-file');
const mkdirp = require('mkdirp');
const path = require('path');
const upndown = require('upndown');

function replaceAt(string, index, replace) {
  return string.substring(0, index) + replace + string.substring(index + 1);
}

const contentDir = "content/posts/";

glob("_posts/tumblr/"+process.argv[2]+"*.html", function (er, files) {

  files.forEach(function(file) {
    console.log(file);

    var postName = path.basename(file).replace(".html","");
    postName = replaceAt(postName,4,'');
    postName = replaceAt(postName,6,'');
    console.log(postName);

    var postDate = path.basename(file).substring(0, 10);

    mkdirp(contentDir+postName, function (err) {
        if (err) console.error(err)
        else console.log(postName, 'dir created!')
    });

    const $ = cheerio.load(fs.readFileSync(file));

    links = $('img'); //jquery get all hyperlinks
    $(links).each(function(i, link){

      var filename = path.basename($(link).attr('src'));
      console.log($(link).attr('src'),filename);

      var options = {
        directory: contentDir+postName,
        filename: filename
      }

      download($(link).attr('src'),options, function(err){

          console.log('File saved to', filename);
          $(link).attr('src', filename);

          var html = $.html();

          var und = new upndown();
          und.convert(html, function(err, markdown){
            if(err) { console.err(err);}
            var regex =  new RegExp("(!)(\\[.*?\\])(\\()","gim");

            var md = markdown.replace('--- layout: post title: no title ','')
            var md = md.replace('tags: []','\n')
            var md = md.replace('---','\ntext: ')
            var md = md.replace(' tumblr_url:','\n----\n\ntumblr_url:')
            var md = md.replace('text:','\n----\n\ntext:')
            var md = md.replace('date:','timestamp:')
            var md = md.replace('text:','Text:')
            var md = md.replace(regex, '(image: ')

            var md = 'Date: '+postDate+'\n\n----\n\n'+md;
            var md = 'Title: '+postName.slice( 9 )+'\n\n----\n\n'+md;

            fs.writeFile(contentDir+postName+'/article.txt', md, function(err) {
              if(err) return console.log(err);
              console.log(file, "saved");
            });
          });

        if (err) throw err
      })
    });

  });

})

