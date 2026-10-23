ARIA WEBSITE — Music update ♡

Open index.html from a local web server for the most reliable Discord and audio behavior.
(An editor such as VS Code with Live Server is ideal.)

What is new
- Spotify mini status next to Minecraft accounts: Lanyard uses Discord ID 506950390839902208.
  You need Spotify linked to Discord, “Display on profile” enabled, and your account enrolled in Lanyard.
  Spotify playback is NOT provided through the widget: it displays your now-playing song and links to Spotify.
- Music desktop window: double-click Music; click Yeat tracks for playback; volume & seeking supported.
  The audio stops/reset when you close via × or Esc. No song auto-plays on site load.
- Three Yeat MP3s provided by you are located in music/.
- OsamaSon and Bunii tracks and slots 4-5 await details. Edit musicArtists in index.html.
  To add a track, put an MP3 in music/ and add { name: "Track", file: "music/track.mp3" }.
- Artist portraits are remotely sourced when online; local illustrated fallbacks live in assets/.
- Maintains existing content, including your custom 27 Minecraft accounts and 4 friend entries.

Note: If you publish the site, ensure you have permission to publicly host the MP3 recordings.

Version 9 Music changes: artists Yeat, OsamaSon, rexv2, jaydes, Bunii.
Only 3 uploaded Yeat tracks are playable. The other song rows have artwork
previews sourced from verified release images or exact-track Apple Music public
searches when online; local placeholder artwork appears otherwise.
Change names and album art in const musicArtists. To specify custom covers,
add an artwork field pointing to an image in assets/.
