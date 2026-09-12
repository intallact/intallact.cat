/* Plain browser JavaScript. Opens locally; no imports or build step. */
(() => {
"use strict";
const CDN = "https://cdn.discordapp.com";
const FALLBACK_AVATAR = "./assets/avatar.svg";
const validId = value => typeof value === "string" && /^[0-9]{17,20}$/.test(value);

function safeImage(value) {
  if (typeof value !== "string" || !value) return "";
  if (/^\.\/[a-zA-Z0-9_./-]+$/.test(value)) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : "";
  } catch { return ""; }
}

function avatarUrl(user, reducedMotion = false) {
  if (!validId(user?.id)) return FALLBACK_AVATAR;
  if (typeof user.avatar === "string" && /^(a_)?[a-f0-9]+$/i.test(user.avatar)) {
    return `${CDN}/avatars/${user.id}/${user.avatar}.${reducedMotion ? "png" : "webp"}?size=256${!reducedMotion && user.avatar.startsWith("a_") ? "&animated=true" : ""}`;
  }
  const legacy = /^\d{4}$/.test(user.discriminator || "") && Number(user.discriminator) !== 0;
  const index = legacy ? Number(user.discriminator) % 5 : Number((BigInt(user.id) >> 22n) % 6n);
  return `${CDN}/embed/avatars/${index}.png`;
}

function decorationUrl(user) {
  const asset = user?.avatar_decoration_data?.asset;
  return typeof asset === "string" && /^(a_)?[a-f0-9]+$/i.test(asset)
    ? `${CDN}/avatar-decoration-presets/${asset}.png?size=256` : "";
}

function statusLabel(status) {
  return ({ online: "online", idle: "away", dnd: "do not disturb", offline: "offline" })[status] || "status unavailable";
}

function songProgress(spotify, now = Date.now()) {
  const start = Number(spotify?.timestamps?.start);
  const end = Number(spotify?.timestamps?.end);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
  const duration = end - start;
  const elapsed = Math.max(0, Math.min(now - start, duration));
  return { duration, elapsed, percentage: elapsed / duration * 100, ended: now >= end };
}

function formatTime(milliseconds) {
  const seconds = Math.max(0, Math.floor(Number(milliseconds || 0) / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

async function fetchPresence(id, signal) {
  if (!validId(id)) throw new Error("invalid_id");
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  const timeout = setTimeout(abort, 8000);
  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${id}`, {
      signal: controller.signal, credentials: "omit", cache: "no-store"
    });
    if (!response.ok) throw new Error(response.status === 404 ? "not_monitored" : "unavailable");
    const body = await response.json();
    if (!body.success || body.data?.discord_user?.id !== id) {
      throw new Error(body.error?.code === "user_not_monitored" ? "not_monitored" : "unavailable");
    }
    return body.data;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}

const validMinecraftName = value => typeof value === "string" && /^[A-Za-z0-9_]{3,16}$/.test(value);
const validUuid = value => typeof value === "string" && /^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i.test(value);

function normalizeMinecraftAccounts(values) {
  const seen = new Set();
  return (Array.isArray(values) ? values : []).flatMap(value => {
    const item = typeof value === "string" ? { username: value } : value;
    if (!item || !validMinecraftName(item.username)) return [];
    const key = item.username.toLowerCase();
    if (seen.has(key)) return [];
    seen.add(key);
    return [{ username: item.username, uuid: validUuid(item.uuid) ? item.uuid.replaceAll("-", "") : "" }];
  });
}

function minecraftHeadUrl(account) {
  if (!validMinecraftName(account?.username)) return "";
  const identifier = validUuid(account.uuid) ? account.uuid.replaceAll("-", "") : account.username;
  return `https://mc-heads.net/avatar/${identifier}/64`;
}

function labyProfileUrl(account) {
  return validMinecraftName(account?.username) ? `https://laby.net/@${account.username}` : "";
}

// Friends use the same public Lanyard API as your own profile.
async function fetchFriendProfile(id, signal) {
  const data = await fetchPresence(id, signal);
  return data.discord_user;
}

const config = window.siteConfig;
function rememberTab(name) {
  try { history.replaceState(null, "", `#${name}`); }
  catch { location.hash = name; }
}

const $ = id => document.getElementById(id);
const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
const configured = validId(config.discordId);
let currentPresence = null;
let currentSong = null;
let pollTimer;
let running = false;
let failures = 0;
let lastFriendsRefresh = 0;
let friendsRefresh = null;
let destroyed = false;
const lifecycle = new AbortController();

function setImage(image, source, fallback = FALLBACK_AVATAR) {
  const next = source || fallback;
  if (image.getAttribute("src") === next) return;
  image.onerror = () => {
    image.onerror = null;
    if (fallback) image.src = fallback;
    else { image.hidden = true; image.removeAttribute("src"); }
  };
  if (next) image.src = next;
  else image.removeAttribute("src");
}

function setLink(link, url) {
  if (url) {
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.removeAttribute("aria-disabled");
  } else {
    link.removeAttribute("href");
    link.setAttribute("aria-disabled", "true");
  }
}

function selectTab(name, focus = false) {
  if (!["about", "friends", "extra", "contact"].includes(name)) name = "about";
  document.querySelectorAll("[data-tab]").forEach(button => {
    const active = button.dataset.tab === name;
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
    if (active && focus) button.focus();
  });
  document.querySelectorAll('[role="tabpanel"]').forEach(panel => { panel.hidden = panel.id !== `panel-${name}`; });
  $("window-title").textContent = name;
  if (name === "friends") refreshFriends();
}

const tabs = [...document.querySelectorAll("[data-tab]")];
tabs.forEach((button, index) => {
  button.addEventListener("click", () => {
    selectTab(button.dataset.tab);
    rememberTab(button.dataset.tab);
  });
  button.addEventListener("keydown", event => {
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    selectTab(tabs[next].dataset.tab, true);
    rememberTab(tabs[next].dataset.tab);
  });
});
window.addEventListener("hashchange", () => selectTab(location.hash.slice(1)));

function setName(name) {
  const value = name || "your name";
  $("display-name").textContent = value;
  $("site-caption").textContent = name ? `${name}'s little corner` : "a little corner";
  document.title = name ? `${name} ♡` : "a little corner ♡";
}

setName(config.displayName);
if (config.pronouns) {
  $("pronouns").textContent = config.pronouns;
  $("pronouns").hidden = false;
}
if (Array.isArray(config.about) && config.about.length) {
  $("about-text").replaceChildren(...config.about.map(text => {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    return paragraph;
  }));
}
$("extra-example-label").hidden = !config.extraIsExample;
const extraParagraphs = Array.isArray(config.extra) && config.extra.length ? config.extra : ["a little more about me, coming soon."];
$("extra-text").replaceChildren(...extraParagraphs.map(text => {
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  return paragraph;
}));
setImage($("profile-avatar"), safeImage(config.avatarUrl));
const fallbackDecoration = safeImage(config.decorationUrl);
if (fallbackDecoration) {
  setImage($("profile-decoration"), fallbackDecoration, "");
  $("profile-decoration").hidden = false;
}
if (configured) {
  setLink($("discord-avatar-link"), `https://discord.com/users/${config.discordId}`);
  $("discord-avatar-link").setAttribute("aria-label", "Open my Discord profile");
  $("discord-name").textContent = "loading profile…";
  $("discord-status").textContent = "connecting…";
}

function renderContacts(user) {
  const list = $("contact-list");
  list.replaceChildren();
  const add = (label, value, url) => {
    const row = document.createElement("div");
    const term = document.createElement("dt");
    const definition = document.createElement("dd");
    term.textContent = label;
    if (url) {
      const link = document.createElement("a");
      link.textContent = value;
      setLink(link, url);
      definition.append(link);
    } else { definition.textContent = value; definition.className = "muted"; }
    row.append(term, definition);
    list.append(row);
  };
  add("discord", user?.username ? `@${user.username}` : configured ? "open my profile" : "not connected yet", configured ? `https://discord.com/users/${config.discordId}` : "");
  const contacts = config.contacts || {};
  if (/^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(contacts.email || "")) add("email", contacts.email, `mailto:${contacts.email}`);
  if (/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(contacts.github || "")) add("github", contacts.github, `https://github.com/${contacts.github}`);
  try {
    const url = new URL(contacts.spotify);
    if (url.protocol === "https:" && url.hostname === "open.spotify.com" && !url.username && !url.password) add("spotify", "my spotify", url.href);
  } catch { /* Unconfigured contact. */ }
}
renderContacts();

function renderProfile(data) {
  currentPresence = data;
  const user = data.discord_user;
  setName(config.displayName || user.global_name || user.username);
  $("discord-name").textContent = `@${user.username || "unknown"}`;
  $("profile-avatar").alt = `${user.global_name || user.username || "Discord"}'s profile picture`;
  setImage($("profile-avatar"), avatarUrl(user, motion.matches), safeImage(config.avatarUrl) || FALLBACK_AVATAR);
  const decoration = decorationUrl(user) || fallbackDecoration;
  $("profile-decoration").hidden = !decoration;
  if (decoration) setImage($("profile-decoration"), decoration, "");
  const status = ["online", "idle", "dnd", "offline"].includes(data.discord_status) ? data.discord_status : "unknown";
  $("status-dot").dataset.status = status;
  $("discord-status").textContent = statusLabel(status);
  const activity = Array.isArray(data.activities) ? data.activities.find(activity => activity.type === 4) : null;
  $("custom-status").textContent = activity?.state || "";
  $("custom-status").hidden = !activity?.state;
  renderContacts(user);
  renderMusic(data);
}

function musicEmpty(state, title, subtitle) {
  currentSong = null;
  $("music").dataset.state = state;
  $("music-state").textContent = state === "loading" ? "connecting…" : "spotify";
  $("track-link").textContent = title;
  setLink($("track-link"), "");
  $("track-artist").textContent = subtitle;
  $("album-art").hidden = true;
  $("album-art").removeAttribute("src");
  $("album-placeholder").hidden = false;
  $("track-progress").hidden = true;
  $("listen-link").hidden = true;
  setLink($("listen-link"), "");
}

function updateProgress() {
  if (!currentSong) return;
  const progress = songProgress(currentSong);
  $("track-progress").hidden = !progress;
  if (!progress) return;
  $("song-progress").value = progress.percentage;
  $("song-progress").setAttribute("aria-valuetext", `${formatTime(progress.elapsed)} of ${formatTime(progress.duration)}`);
  $("elapsed").textContent = formatTime(progress.elapsed);
  $("duration").textContent = formatTime(progress.duration);
  // Do not keep claiming a song is playing after its end timestamp.
  if (progress.ended) {
    $("music").dataset.state = "waiting";
    $("music-state").textContent = "between songs";
  }
}

function renderMusic(data) {
  if (!data.listening_to_spotify || !data.spotify?.song) {
    musicEmpty("idle", "nothing playing right now", "a little quiet for the moment.");
    return;
  }
  const song = data.spotify;
  currentSong = song;
  $("music").dataset.state = "playing";
  $("music-state").textContent = "listening now";
  $("track-link").textContent = song.song;
  $("track-artist").textContent = [song.artist, song.album].filter(Boolean).join(" · ");
  const url = typeof song.track_id === "string" && /^[a-zA-Z0-9]{22}$/.test(song.track_id) ? `https://open.spotify.com/track/${song.track_id}` : "";
  setLink($("track-link"), url);
  setLink($("listen-link"), url);
  $("listen-link").hidden = !url;
  const art = safeImage(song.album_art_url);
  $("album-art").hidden = !art;
  $("album-placeholder").hidden = !!art;
  if (art) {
    $("album-art").alt = `${song.album || song.song} album cover`;
    setImage($("album-art"), art, "");
    $("album-art").onerror = () => { $("album-art").hidden = true; $("album-art").removeAttribute("src"); $("album-placeholder").hidden = false; };
  }
  updateProgress();
}

const friends = (Array.isArray(config.friends) ? config.friends : []).map(friend => typeof friend === "string" ? { id: friend } : friend).filter(friend => friend && validId(friend.id));
const uniqueFriends = friends.filter((friend, index) => friends.findIndex(item => item.id === friend.id) === index);
const friendElements = new Map();

function createFriendCard(friend, list) {
  const item = document.createElement("li");
  const link = document.createElement("a");
  link.className = "bestie";
  setLink(link, `https://discord.com/users/${friend.id}`);
  const avatar = document.createElement("img");
  avatar.className = "friend-avatar";
  avatar.width = 32; avatar.height = 32; avatar.alt = "";
  avatar.loading = "lazy";
  avatar.decoding = "async";
  setImage(avatar, safeImage(friend.avatarUrl));
  const label = document.createElement("span");
  label.className = "friend-label";
  label.textContent = friend.name || (friend.live === false ? `user …${friend.id.slice(-4)}` : "loading…");
  link.append(avatar, label); item.append(link); list.append(item);
  return { link, avatar, label };
}

uniqueFriends.forEach(friend => {
  friendElements.set(friend.id, createFriendCard(friend, $("friends-list")));
});
$("friends-empty").hidden = uniqueFriends.length > 0;
$("friend-count").hidden = uniqueFriends.length === 0;
$("friend-count").textContent = uniqueFriends.length ? String(uniqueFriends.length) : "";
$("friends-example-label").hidden = !uniqueFriends.some(friend => friend.example);

const savedMinecraftAccounts = normalizeMinecraftAccounts(config.minecraftAccounts);
const minecraftExamples = savedMinecraftAccounts.length === 0;
const minecraftAccounts = minecraftExamples
  ? normalizeMinecraftAccounts(["MHF_Steve", "MHF_Alex"])
  : savedMinecraftAccounts;
const minecraftPicker = $("minecraft-picker");
const minecraftSummary = minecraftPicker.querySelector("summary");
const exampleHeads = { MHF_Steve: "./assets/minecraft-steve.png", MHF_Alex: "./assets/minecraft-alex.png" };

function setMinecraftHead(image, account) {
  const source = minecraftExamples ? exampleHeads[account.username] : minecraftHeadUrl(account);
  setImage(image, source);
}

function selectMinecraftAccount(account) {
  $("minecraft-current-name").textContent = account.username;
  setMinecraftHead($("minecraft-current-head"), account);
}

minecraftPicker.querySelector(".account-caption").textContent = minecraftExamples ? "minecraft · examples" : "minecraft accounts";
$("minecraft-list-caption").textContent = minecraftExamples ? "sample accounts · open on Laby" : "my accounts · open on Laby";
$("minecraft-count").textContent = minecraftAccounts.length > 1 ? `+${minecraftAccounts.length - 1}` : "";
minecraftAccounts.forEach(account => {
  const item = document.createElement("li");
  const link = document.createElement("a");
  link.className = "account-link";
  setLink(link, labyProfileUrl(account));
  link.setAttribute("aria-label", `Open ${account.username} on Laby${minecraftExamples ? " (example account)" : ""}`);
  const head = document.createElement("img");
  head.className = "minecraft-head";
  head.width = 28; head.height = 28; head.alt = "";
  setMinecraftHead(head, account);
  const name = document.createElement("span");
  name.textContent = account.username;
  const arrow = document.createElement("span");
  arrow.textContent = "↗";
  arrow.setAttribute("aria-hidden", "true");
  link.append(head, name, arrow);
  link.addEventListener("click", () => {
    selectMinecraftAccount(account);
    minecraftPicker.open = false;
    minecraftSummary.focus();
  });
  item.append(link);
  $("minecraft-list").append(item);
});
selectMinecraftAccount(minecraftAccounts[0]);

document.addEventListener("pointerdown", event => {
  if (minecraftPicker.open && !minecraftPicker.contains(event.target)) minecraftPicker.open = false;
});
minecraftPicker.addEventListener("keydown", event => {
  if (event.key === "Escape" && minecraftPicker.open) {
    event.preventDefault();
    minecraftPicker.open = false;
    minecraftSummary.focus();
  }
});
minecraftPicker.addEventListener("focusout", event => {
  if (event.relatedTarget && !minecraftPicker.contains(event.relatedTarget)) minecraftPicker.open = false;
});

async function refreshFriends(force = false) {
  if (destroyed || !uniqueFriends.length || friendsRefresh || (!force && Date.now() - lastFriendsRefresh < 600000)) return;
  lastFriendsRefresh = Date.now();
  friendsRefresh = (async () => {
    // Small batches avoid a burst of requests when a friend list grows.
    for (let index = 0; index < uniqueFriends.length && !destroyed; index += 3) {
      await Promise.allSettled(uniqueFriends.slice(index, index + 3).map(async friend => {
        if (friend.live === false) return;
        const elements = friendElements.get(friend.id);
        try {
          const user = await fetchFriendProfile(friend.id, lifecycle.signal);
          elements.label.textContent = user.username || friend.name || "Discord friend";
          elements.link.title = `Open ${user.global_name || user.username}'s Discord profile`;
          elements.link.classList.remove("friend-unavailable");
          elements.loaded = true;
          setImage(elements.avatar, avatarUrl(user, motion.matches), safeImage(friend.avatarUrl) || FALLBACK_AVATAR);
        } catch {
          // Keep the last successful profile or configured fallback on errors.
          if (elements.label.textContent === "loading…") elements.label.textContent = friend.name || `user …${friend.id.slice(-4)}`;
          elements.link.title = friend.name ? `Open ${friend.name}'s Discord profile` : "Profile unavailable right now. Open on Discord.";
          elements.link.classList.toggle("friend-unavailable", !friend.name && !elements.loaded);
        }
      }));
    }
  })();
  try { await friendsRefresh; } finally { friendsRefresh = null; }
}

async function refreshProfile() {
  if (!configured || running || destroyed || document.hidden) return;
  running = true;
  clearTimeout(pollTimer);
  try {
    const data = await fetchPresence(config.discordId, lifecycle.signal);
    if (destroyed) return;
    renderProfile(data);
    failures = 0;
  } catch (error) {
    if (destroyed) return;
    failures += 1;
    $("status-dot").dataset.status = "unknown";
    $("discord-status").textContent = error.message === "not_monitored" ? "not connected to Lanyard" : "status unavailable";
    if (!currentPresence) $("discord-name").textContent = config.displayName || "Discord profile";
    $("custom-status").hidden = true;
    musicEmpty("unavailable", "music status unavailable", "check back in a little while.");
  } finally {
    running = false;
    if (!destroyed && !document.hidden) pollTimer = setTimeout(refreshProfile, Math.min(30000 * 2 ** failures, 120000));
  }
}

if (configured) {
  musicEmpty("loading", "checking what's playing…", "just a moment.");
  refreshProfile();
}
selectTab(location.hash.slice(1));
const progressTimer = setInterval(() => { if (!document.hidden) updateProgress(); }, 1000);
document.addEventListener("visibilitychange", () => {
  clearTimeout(pollTimer);
  if (!document.hidden) {
    updateProgress();
    refreshProfile();
    if (!$("panel-friends").hidden) refreshFriends();
  }
});
window.addEventListener("online", () => { refreshProfile(); if (!$("panel-friends").hidden) refreshFriends(true); });
motion.addEventListener("change", () => { if (currentPresence) renderProfile(currentPresence); });
window.addEventListener("pagehide", event => {
  if (event.persisted) return;
  destroyed = true;
  clearTimeout(pollTimer);
  clearInterval(progressTimer);
  lifecycle.abort();
});

})();
