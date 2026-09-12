# A little corner — plain HTML edition

## Open the website

1. Extract the whole ZIP (do not open the HTML from inside the ZIP).
2. Double-click `index.html` to open it in your web browser.

No installation, terminal, build, localhost server, Node.js, or bot token is required.
Keep `index.html`, `styles.css`, `config.js`, `script.js`, and `assets/` together.
The layout, Sacramento heading font, moving clouds, tabs, scrollable extra section,
Minecraft picker, and flags are preserved. The font is embedded in the stylesheet
so it also loads from a local file. The site can also be uploaded to static hosting.

## Personalize it

Open `config.js` in a text editor, save your changes, then refresh the page.
- `discordId`: your Discord user ID in quotes.
- `displayName`, `pronouns`, `about`, and `extra`: your name and bio.
- Set `extraIsExample: false` after replacing the sample extra text.
- `friends`: your friends' Discord IDs in quotes, in the order you want.
- `minecraftAccounts`: your Minecraft usernames; each links to its Laby profile.
- `contacts`: your optional contact links.

Example friends configuration (replace the placeholders with real IDs):

```js
friends: ["YOUR_FRIENDS_DISCORD_ID", "ANOTHER_FRIENDS_DISCORD_ID"],
```

A labeled example friend is included with a working Lanyard lookup and a bundled
fallback avatar. Replace that example with your own friends. All friends appear
as small circular avatars with usernames below, wrapping into additional rows.
There is no visitor ID-entry form.

## Live Discord and Spotify

Your profile, status, avatar decoration (when supplied), Spotify activity, and
friends' usernames/avatars all use the public Lanyard API. Internet access is
required for live data and remote images. The page itself and local interactions
work offline, using configured fallbacks. Friends refresh when you open the
friends tab (at most once per ten minutes); your own status polls while visible.

You and each friend must be monitored by Lanyard. Join the Discord server linked
in the official instructions: https://github.com/Phineas/lanyard#readme
For Spotify, connect Spotify to Discord and enable displaying it as your status.
No Discord token, Spotify secret, or API key belongs in this code.

For an unmonitored friend, you can still show their name and a saved image:

```js
friends: [
  { id: "FRIENDS_DISCORD_ID", name: "friend", avatarUrl: "./assets/friend.png" }
],
```

Save that image in `assets/`. These values remain visible if the lookup fails.
Add `live: false` to an entry if you want to use only its manual name and image.
ID-only entries with no available data display a default circle and partial ID.
If your browser or an extension blocks live requests, the local page still opens;
check the connection and browser restrictions to restore live updates.

## Files

- `index.html`: page structure; double-click this to open.
- `styles.css`: original design and embedded Sacramento font.
- `config.js`: all personal settings and friend IDs.
- `script.js`: tabs, Lanyard updates, and Minecraft picker.
- `assets/`: original images, sample avatars/heads, and font license.

Cloud assets and design details reuse the supplied aroze.me source.
Sacramento's license is included at `assets/Sacramento-OFL.txt`.
