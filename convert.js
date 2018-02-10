const fs = require('fs');
const glob = require('glob');
const cheerio = require('cheerio');
const download = require('download-file');
const mkdirp = require('mkdirp');
const path = require('path');
const upndown = require('upndown');

const h2k = require('html-to-kirbytext').convert;
const reader = require('html-to-kirbytext/lib/server-reader');

const yaml = require('js-yaml');
const _ = require('lodash');
const filenamify = require("filenamify");

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

    var postFileName = filenamify(postName);
    console.log(postName);

    var postDate = path.basename(file).substring(0, 10);

    mkdirp(contentDir+postFileName, function (err) {
        if (err) console.error(err)
        else console.log(postName, 'dir created!')
    });

    const $ = cheerio.load(fs.readFileSync(file));

    links = $('img'); //jquery get all hyperlinks
    $(links).each(function(i, link){

      var filename = path.basename($(link).attr('src'));
      console.log($(link).attr('src'),filename);

      var options = {
        directory: contentDir+postFileName,
        filename: filename
      }

      download($(link).attr('src'),options, function(err){

          console.log('File saved to', filename);
          $(link).attr('src', filename);

            var html = $.html();

            var md = h2k(reader(html));

            var data = md.split("\n---\n");
            var a = yaml.safeLoad(data[0]);
            var markdown = data[1];

            a.Text = markdown;
            a.Date = postDate;

            a.timestamp = a.date;
            a.title = postName.slice( 9 );
            delete a.date;
            delete a.layout;


            const map1 = _.map(a, (value, key) => {

              return _.capitalize(key)+": "+value;
            });

            kyaml = map1.join("\n\n----\n\n")

            fs.writeFile(contentDir+postFileName+'/article.txt', kyaml, function(err) {
              if(err) return console.log(err);
              console.log(file, "saved");
            });

        if (err) throw err
      })
    });

  });

})

