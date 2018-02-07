require "jekyll-import";

JekyllImport::Importers::Tumblr.run({
    "url"            => "http://nouveau.plateforme.org",
    "format"         => "html", # "md" misses links and images etc
    "grab_images"    => false,
    "add_highlights" => false,
    "rewrite_urls"   => false # `true` breaks build
})
