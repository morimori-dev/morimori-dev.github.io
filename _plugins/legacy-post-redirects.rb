# frozen_string_literal: true

require "cgi"
require "fileutils"
require "json"

module Jekyll
  class LegacyPostRedirectFile < StaticFile
    def initialize(site, legacy_permalink, target_url)
      @site = site
      @base = site.source
      @dir = legacy_permalink.sub(%r{\A/}, "").sub(%r{/index\.html\z}, "").sub(%r{/\z}, "")
      @name = "index.html"
      @relative_path = File.join(@dir, @name)
      @extname = ".html"
      @type = nil
      @target_url = target_url
      @data = {
        "sitemap" => false,
        "robots" => "noindex"
      }
    end

    def url
      @url ||= "/#{relative_path}"
    end

    def path
      @path ||= File.join(@base, @relative_path)
    end

    def modified_time
      @modified_time ||= @site.time
    end

    def mtime
      modified_time.to_i
    end

    def modified?
      true
    end

    def data
      @data
    end

    def write(dest)
      dest_path = destination(dest)
      FileUtils.mkdir_p(File.dirname(dest_path))
      File.write(dest_path, content)
      File.utime(modified_time, modified_time, dest_path)
      true
    end

    private

    def content
      escaped_target = CGI.escapeHTML(target_url)
      js_target = JSON.generate(target_url)
      <<~HTML
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="robots" content="noindex">
            <link rel="canonical" href="#{escaped_target}">
            <meta http-equiv="refresh" content="0; url=#{escaped_target}">
            <title>Redirecting...</title>
          </head>
          <body>
            <p>Redirecting to <a href="#{escaped_target}">#{escaped_target}</a>.</p>
            <script>window.location.replace(#{js_target});</script>
          </body>
        </html>
      HTML
    end

    def target_url
      @target_url
    end
  end

  class LegacyPostRedirectGenerator < Generator
    safe true
    priority :low

    def generate(site)
      site.posts.docs.each do |post|
        legacy = post.data["legacy_permalink"].to_s
        next if legacy.empty? || legacy == post.url

        target_url = "#{site.config["url"].to_s.chomp("/")}#{post.url}"
        site.static_files << LegacyPostRedirectFile.new(site, legacy, target_url)
      end
    end
  end
end
