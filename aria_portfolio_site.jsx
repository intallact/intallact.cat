import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SiPinterest,
  SiTiktok,
  SiSpotify,
  SiModrinth,
  SiGithub,
} from "react-icons/si";
import { FaDiscord } from "react-icons/fa";
import { Globe, Music2, ExternalLink, Heart, Sparkles } from "lucide-react";

const MAIN_ID = "506950390839902208";
const FRIEND_AVATARS = {
  april:
    "data:image/webp;base64,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",
  qblast:
    "data:image/webp;base64,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",
  harvong:
    "data:image/webp;base64,UklGRowFAABXRUJQVlA4IIAFAAAQIACdASqAAIAAPm0wk0ekIqQnKZeaUOANiWczmqHNQ9wBbcGg7sRxrGNvJwSQm8nFydN4g0we080EulPaApDW7U7mmp3Nt6VfE/OrWbudij5F4sVSgm4oDH34PUiKMKZHZ2o4pDLEFYA5kJc7Bt9ABdWPSd7n5+kzL4mnDpCVzKTx8r338/UES1iCQpPZm4TEo4MIuhF6zatqypGAV8/TYPWYKjyVsFlvAOigKgKpIB5ERienUp47NDGI2H0eyUFOXHCyl57Ef7lS+5vwWq4ccfVOsnOSUV2Hi5qn4mnSOP5vpQDrM5oOnp9W7FnHk/Ulxjd2K/4snK/ysGGnd5sWuF80vLhZSyRkAP79C6j6qQD/LB/JLBUwASE8eD9wVnb1fM/Hc4Agr9i5X4hhQ8nS0bq8fQM8KYM5n9dWSIWLMfNs522xn4XEiDDW7tJgw3vlk2JJF2hBaFwy0UEIwYImC2zOgGYmExt1znY0sk5gOAyF6xKJo7pwdeBmbXgegpb1iwC5Mxpc5PeJL7xOhQYoxTtoXAKT6rj5lt5QSW51m/dHlwZ5NSIgIF6NJswPBwQf/x43QxUcuq9MMR7B0gImEQD0pACeuT5mTSLfDYEuvQrfAhZgY591Cgwo7Uy8Q5pZqsfMek2NlZbhaV/Kxb3ZyCMPnumzFB5KbDVVbPbi/yxH3oktK+2HXt3tU3XRNdioBMWv2XcHDkFecCYuNeGOTP13sqOZQAY48Pd7a51upCHJhk0HhlsTN+9mGGSE1tafl9NRxE6O0ieHfBQH7dmKKVnr7Yw6URr3VX5ov5LG3y/qAmFa+jtdxWoqJ+cIY3oW6/3dusRysnzpYrY0ibEm7icrKiiK3wTeTsmLYrS4gu/s9bs0pXl3/tu0dEzWTUIHLQlamNtaK6SIev01dk1OM3SNZ0te/3zsxdPwR8RlbvCSFSr0fyDW5pV6UC3+kmzd2dn3yDLqCN9oGi+5g1/iQ40X7qbnIQcHn4bfr7GOQq75FARraUPoQ613AI79xfODeggIrnPfk8SEGA4w4M+n14N8ycCpPuAQbMkkztKAe+JjbrCvSpc9O/H9Mcc/VykX8T/Pjnnt95K1tPogEVO1OM6LfcQbCkziFZ1HUGx9Ne+dG5BSFaYTeyC+I2u16SCsR0c8FpiN4TLTAgqYBFalkEovn3xebbMl4VMxUCda/iPORzu5gTNhaAum1UYAZ0Ozuldw3Vc0FBE+CiuvLijWQekJodKyt1dF3Nigg+abTL2ajyWRFENKlGkU537SYrTDLJ015MLTMpcQZTzsnrOmyuS0maBB5r3Jgmy91hhffwiOQ+v7jVjW4xBQoPG507yfAMvpiQmBA4h+qsjH1HyRmcR9AD/S+xDObuvZs7FNsviD/Um5hvYuh8KmbuwO528KSvKkcKhIButRydijigpSvLHClzCL1CEzOPNSzNeCXG+18k72P9kpQfwZiFIx6JY/U4m8Q1fvvyerh3vZYEfaBcW3FzreH3nEYrZIQ6bxlz1QcOWA+BOLF/5Gg//mB2Nq4h5ws56Tnr7AfG4GlpniMrarQKfwaSCl857TYO5m/1q4GFHcmbiNHPUsGqQzjT2SBAdN8BeQqRwap3vn877GY1KceJ/RSo0tPYIvoI1IdFNAtWprSi+/z+SyW+EMxu/M4cqJ3O0lJNs0bXEtZsucwUJS8NyOFzB0d0Q5uuEWm+U7lTxboLwyZYe2zP2JIoV0VzXvTfKXl9fZec4hmX5HinyQuKmBZLfq/LoViHKXx/BtIqy+7/ECwD41BVU/VrydTZcSS+1zU3/wLSZJV2wSO66+4jJ0sxfKaTUEeYJ1vEg8cXO+aEjpI721W9XD/lpHJUotyIdym3rQjl1JiuAA",
  Eery:
    "data:image/webp;base64,UklGRgQEAABXRUJQVlA4IPgDAACQFwCdASqAAIAAPm00lUakIyIhLBSpmIANiUAaoDgX6f43lM4V4Fv5E/0e/J8wH7FesN/TfVF/pvSA6gD0APLi9lDAS+xH9SpJYs8MZcSOkCaYLhPc4uIBBnMe8+DZuWLMk5XRBPy5pzlPF6mRsXBQgT3HiuwKNxdqElJFnfsldJv8wXrWqbxRueg8THUXq7f5MiTLWWJFnHPNq9ggRIpC1t7JH7NSi3R8g+Ym9hIH/6T3d5wEOJzZyCVGoFFNmn46Ga+KgAD+21Bqzaf/8+q/0D+r+8gAAHh8O/Sh8XYKRigv1QxqeSDNgEt1NcnLs/3zprFRT1dIxJuJv5H7/4Yv8nFSmurU4rO/WyPagtHC3RfFPh7dE0/xnnMH23svkNa2m56V/7MzYx9g1/55VjX34kY1ofGuLB4Wn2C35CvN7UVCzz78ZMdt43PnvmT8rkzEfPmNfsSpFKeUc4WMI6XpYhPv7fGAgAoCqT2jgi7jm4dSqc1ssh4DaCOuYeh8Hpecq3N9ZziorgC0iAib67gbPaZEGf0xyBvmq9nVDAs8S0wyDnFOdORih93gf1TwZKqAzmTRGK30n7LA2cktn61cF6TuuG16LgFp7PB8mIyeCjM1K1mtYRUc+YB6MLgWgKZbBbnPNLcyg2Vlvg6nhQ0duHJ/XWuN1O+UC9k9C7Pbe1WQyngaSG0Usz7R5/ng3L6KzimZ+yDaIINzEOWGbIVmo9aE4dTOY4VHlBjRmEeUgVNJuty/7YcDcCxpMjmWMMGS+mSs2nOYjVLpKkxLjgFHnHfj0siIgo7Xf/T87N8l6EMhj27ip2o/k/8iyawADJVPh4/pdybYJMGvpxxyJDu9L9zrVPxhWLdG0SgRSjxWG6UAG1Z68qYWZS0Y0Ph5vJccCTcEX7wYxjcurdCSMMrwBZoZObp1d+9pNcDWT6G9zQpLEqQUgA+8Qd81eheQp/mV/eQ1tzoJOA6NCShE5cKzZfILJXPl5f3SWLhue8/9gBQAE7SrtIFl4G/wOwRgQgio/F5DojnZHru0diAdDR/3smufdrZ0abqxtQog0y3EQ35vv0DzpCXEW2qfzlLa0tVRmG99/BN9BL8JDSrGnJUcS8Mj5ruL/s4KQFlQNKkh5lMvG+BZWduPygUC4um1+F1Wci/Xmnkn2cwmjCAVWcotMTHvLKn88yLfZ/sZxTQ/BMgn06pWSu+i9j1vUUZPVTlGHrPHBuaIHrpYX/gE/NTMUGg0yR9gZ5OOZB6ZkHsfXCqeKeQVNuPEF40GxCD8p0rigLC1f413UOXwUfL4GLGFIcUYDflva2XSB3WIETVIuKftP5zgAeQaYu2i9DQh6trF5LaQAAAAAA==",
  luna:
    "data:image/webp;base64,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"
};
const FRIENDS = [
  {
    id: "1476943197178429671",
    name: "april",
    avatar: FRIEND_AVATARS.april,
  },
  {
    id: "1297538877011267606",
    name: "qblast",
    avatar: FRIEND_AVATARS.qblast,
  },
  {
    id: "262287798118252544",
    name: "harvong",
    avatar: FRIEND_AVATARS.harvong,
  },
  {
    id: "759103624449884200",
    name: "Eery",
    avatar: FRIEND_AVATARS.Eery,
  },
  {
    id: "1461236905126662251",
    name: "luna",
    avatar: FRIEND_AVATARS.luna,
  },
];

const SOCIALS = [
  {
    name: "Pinterest",
    href: "https://nl.pinterest.com/catgirlaria/",
    icon: SiPinterest,
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@intallact",
    icon: SiTiktok,
  },
  {
    name: "GitHub",
    href: "https://github.com/intallact",
    icon: SiGithub,
  },
  {
    name: "Pronouns",
    href: "https://en.pronouns.page/@kittyaria",
    icon: Globe,
  },
  {
    name: "Spotify",
    href: "https://open.spotify.com/user/31vbhbxr7q6ka4usimdq3xeejh6q",
    icon: SiSpotify,
  },
  {
    name: "NameMC",
    href: "https://namemc.com/profile/Intallact",
    icon: Globe,
  },
  {
    name: "Modrinth",
    href: "https://modrinth.com/user/Intallact",
    icon: SiModrinth,
  },
];

function useLanyard(userId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
        const json = await res.json();
        if (!cancelled && json?.success) {
          setData(json.data);
        }
      } catch (error) {
        if (!cancelled) {
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const timer = setInterval(load, 20000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [userId]);

  return { data, loading };
}

function statusColor(status) {
  if (status === "online") return "bg-green-400";
  if (status === "idle") return "bg-amber-300";
  if (status === "dnd") return "bg-rose-400";
  return "bg-slate-300";
}

function prettyStatus(status) {
  if (!status) return "Offline";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatTimeLeft(endTimestamp) {
  const diff = Math.max(0, endTimestamp - Date.now());
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function Avatar({ user, status, size = "large" }) {
  const avatarUrl = user?.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
    : `https://cdn.discordapp.com/embed/avatars/${Number(user?.discriminator || 0) % 5}.png`;

  const dimensions = size === "large" ? "h-24 w-24" : "h-14 w-14";
  const badge = size === "large" ? "h-5 w-5" : "h-3.5 w-3.5";

  return (
    <div className="relative shrink-0">
      <img
        src={avatarUrl}
        alt={user?.username || "Discord avatar"}
        className={`${dimensions} rounded-full object-cover border-2 border-white/70 shadow-lg`}
      />
      <span
        className={`absolute bottom-1 right-1 ${badge} rounded-full border-2 border-pink-50 ${statusColor(
          status
        )}`}
      />
    </div>
  );
}

function MiniFlag({ type }) {
  const bg =
    type === "trans"
      ? "linear-gradient(to bottom, #5BCEFA 0%, #5BCEFA 20%, #F5A9B8 20%, #F5A9B8 40%, #FFFFFF 40%, #FFFFFF 60%, #F5A9B8 60%, #F5A9B8 80%, #5BCEFA 80%, #5BCEFA 100%)"
      : "linear-gradient(to bottom, #D60270 0%, #D60270 33.33%, #9B4F96 33.33%, #9B4F96 66.66%, #0038A8 66.66%, #0038A8 100%)";

  return (
    <div
      aria-label={type === "trans" ? "Trans flag" : "Bisexual flag"}
      title={type === "trans" ? "Trans flag" : "Bisexual flag"}
      className="h-4 w-6 rounded-sm border border-white/70 shadow-sm"
      style={{ background: bg }}
    />
  );
}

function PresenceCard() {
  const { data, loading } = useLanyard(MAIN_ID);
  const user = data?.discord_user;
  const spotify = data?.spotify;
  const customStatus = useMemo(() => {
    return data?.activities?.find((activity) => activity.type === 4);
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-[28px] border border-white/60 bg-white/45 backdrop-blur-xl shadow-[0_20px_60px_rgba(255,170,210,0.22)] p-6"
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Avatar user={user} status={data?.discord_status} />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-3xl text-pink-900 leading-none">
                {user?.global_name || user?.username || "Aria"}
              </h2>
              <MiniFlag type="trans" />
              <MiniFlag type="bi" />
            </div>
            <p className="text-pink-800/80 text-lg mt-1 flex items-center gap-2">
              <FaDiscord className="opacity-80" />
              {user?.username ? `@${user.username}` : "Discord profile"}
            </p>
            <p className="text-pink-800/70 text-base">Pronouns: she/her</p>
          </div>
        </div>

        <div className="rounded-full border border-pink-200/70 bg-pink-100/70 px-4 py-2 text-pink-900 text-sm shadow-sm">
          {loading ? "Loading status..." : prettyStatus(data?.discord_status)}
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-[24px] bg-pink-50/70 border border-white/60 p-4 shadow-sm">
          <p className="text-pink-950 text-lg flex items-center gap-2">
            <Heart size={18} /> About me
          </p>
          <p className="mt-2 text-pink-900/90 leading-relaxed text-lg">
            hi, my name is Aria, i&apos;m a 17 year old transgirl from the Netherlands
          </p>
          <p className="mt-2 text-pink-900/90 leading-relaxed text-lg">
            i enjoy playing minecraft, roblox, star wars battlefront &amp; alot of other stuff :D
          </p>
          {customStatus?.state ? (
            <p className="mt-3 text-pink-800/75 text-base">
              Current custom status: {customStatus.state}
            </p>
          ) : null}
        </div>

        <div className="rounded-[24px] bg-pink-50/70 border border-white/60 p-4 shadow-sm">
          <p className="text-pink-950 text-lg flex items-center gap-2">
            <Music2 size={18} /> Spotify status
          </p>
          {spotify ? (
            <div className="mt-3 flex gap-4 items-center">
              <img
                src={spotify.album_art_url}
                alt={spotify.album}
                className="h-20 w-20 rounded-2xl object-cover shadow-md border border-white/70"
              />
              <div>
                <p className="text-pink-900 text-xl leading-tight">{spotify.song}</p>
                <p className="text-pink-800/80">{spotify.artist}</p>
                <p className="text-pink-700/75 text-sm mt-1">{spotify.album}</p>
                {spotify?.timestamps?.end ? (
                  <p className="text-pink-700/70 text-sm mt-1">
                    time left: {formatTimeLeft(spotify.timestamps.end)}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-pink-800/75 text-lg">
              not listening to spotify right now
            </p>
          )}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-pink-950 text-lg mb-3 flex items-center gap-2">
          <Sparkles size={18} /> find me here
        </p>
        <div className="flex flex-wrap gap-3">
          {SOCIALS.map((social) => {
            const Icon = social.icon;
            return (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-white/70 bg-pink-200/25 px-4 py-2 text-pink-900 shadow-sm backdrop-blur-md transition hover:bg-pink-200/40 hover:-translate-y-0.5"
              >
                <Icon className="text-lg" />
                <span>{social.name}</span>
                <ExternalLink size={14} className="opacity-70 group-hover:opacity-100" />
              </a>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function FriendCard({ friend, index }) {
  const avatarUrl = friend.avatar;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[24px] border border-white/60 bg-white/40 backdrop-blur-xl p-4 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <img
          src={avatarUrl}
          alt={friend.name}
          className="h-14 w-14 rounded-full object-cover border-2 border-white/70 shadow-lg"
        />
        <div className="min-w-0">
          <p className="text-pink-950 text-lg truncate">{friend.name}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function AriaPortfolioSite() {
  const [tab, setTab] = useState("about");

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-b from-pink-100 via-rose-50 to-pink-100 text-pink-950 relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Quicksand:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        body { font-family: 'Quicksand', sans-serif; }
        h1, h2, h3, button, a, .handwritten { font-family: 'Patrick Hand', cursive; }
      `}</style>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-10 h-40 w-40 rounded-full bg-pink-300/20 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-56 w-56 rounded-full bg-rose-300/20 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-28 w-28 rounded-full bg-fuchsia-200/20 blur-2xl" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-5 py-10 md:py-14">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-8"
        >
          <p className="handwritten text-pink-700 text-2xl md:text-3xl">welcome to aria&apos;s website ♡</p>
          <h1 className="handwritten text-6xl md:text-7xl text-pink-950 mt-2">Aria</h1>
        </motion.div>

        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={() => setTab("about")}
            className={`handwritten rounded-full px-6 py-2.5 text-2xl border transition backdrop-blur-md shadow-sm ${
              tab === "about"
                ? "bg-pink-300/45 border-white/80 text-pink-950"
                : "bg-white/35 border-white/60 text-pink-800 hover:bg-pink-200/35"
            }`}
          >
            about me
          </button>
          <button
            onClick={() => setTab("friends")}
            className={`handwritten rounded-full px-6 py-2.5 text-2xl border transition backdrop-blur-md shadow-sm ${
              tab === "friends"
                ? "bg-pink-300/45 border-white/80 text-pink-950"
                : "bg-white/35 border-white/60 text-pink-800 hover:bg-pink-200/35"
            }`}
          >
            friends
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === "about" ? (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <PresenceCard />
            </motion.div>
          ) : (
            <motion.div
              key="friends"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="rounded-[28px] border border-white/60 bg-white/45 backdrop-blur-xl shadow-[0_20px_60px_rgba(255,170,210,0.22)] p-6"
            >
              <div className="mb-5">
                <h2 className="handwritten text-4xl text-pink-950">friends</h2>
                <p className="text-pink-800/75 mt-1">list of goats</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {FRIENDS.map((friend, index) => (
                  <FriendCard key={friend.id} friend={friend} index={index} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
