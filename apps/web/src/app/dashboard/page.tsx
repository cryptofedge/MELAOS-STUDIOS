'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Play, Heart, MoreHorizontal, Plus, Trash2, Edit3, BarChart3 } from 'lucide-react';
import { mockSongs, formatPlays, mockPlaylists } from '@/lib/mockData';
import { useAudioStore } from '@/lib/store';

const tabs = ['My Songs', 'Liked', 'Playlists', 'Settings'];

const mockUser = {
  displayName: 'Fellito Rodriguez',
  username: 'cryptofedge',
  tier: 'Pro',
  followerCount: 1240,
  followingCount: 87,
  songsGenerated: 47,
  monthlyLimit: 500,
};

const pad = (n: number) => String(n).padStart(2, '0');

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('My Songs');
  const [settingsSaved, setSettingsSaved] = useState(false);
  const { setCurrentSong, likedIds } = useAudioStore();
  const userSongs = mockSongs.slice(0, 8);
  const likedSongs = mockSongs.filter(s => likedIds.includes(s.id));

  return (
    <div className="mx-auto max-w-[1440px] px-safe md:px-8 py-10 sm:py-14">
      {/* ── Profile + readouts ────────────────────────────────────────
          One grid so the action sits top-right on desktop while the
          reading order stays: identity, stats, action, usage. */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-y-6 lg:gap-y-8">
        <div className="lg:col-span-8 lg:row-start-1 self-end flex items-center gap-4 sm:gap-6 min-w-0">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-ink-2 border border-line flex items-center justify-center display font-light text-xl sm:text-2xl text-white">
            FR
            <span className="brand-rule absolute bottom-0 inset-x-0" aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="display font-light text-white leading-[1.05] text-[clamp(1.5rem,5.4vw,2.6rem)]">{mockUser.displayName}</h1>
              <span className="label !text-melaos-orange border border-melaos-orange/40 rounded-xs px-2 py-1">
                {mockUser.tier}
              </span>
            </div>
            <p className="mt-2 font-mono text-[13px] text-fog">@{mockUser.username}</p>
          </div>
        </div>

        {/* Readout strip */}
        <dl className="lg:col-span-6 lg:row-start-2 grid grid-cols-3 gap-px bg-line-soft border border-line-soft">
          {[
            ['Followers', mockUser.followerCount.toLocaleString()],
            ['Following', mockUser.followingCount],
            ['Songs', userSongs.length],
          ].map(([name, value]) => (
            <div key={name} className="bg-ink-0 p-4 sm:p-5 min-w-0">
              <dt className="label">{name}</dt>
              <dd className="mt-3 display font-light text-2xl sm:text-3xl text-white tabular-nums truncate">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="lg:col-span-4 lg:col-start-9 lg:row-start-1 self-end lg:justify-self-end">
          <Link href="/studio" className="btn btn-primary w-full xs:w-auto">
            <Plus className="w-4 h-4" strokeWidth={1.75} /> New Song
          </Link>
        </div>

        {/* Usage quota: joins the readout strip on desktop */}
        <div className="lg:col-span-6 lg:row-start-2 bg-ink-0 border border-line-soft lg:border-l-0 p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-baseline justify-between gap-4">
            <span className="label">Monthly usage</span>
            <span className="font-mono text-[12px] text-fog tabular-nums text-right">{mockUser.songsGenerated} / {mockUser.monthlyLimit} songs</span>
          </div>
          <div className="relative mt-5 h-1.5 bg-ink-3 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-melaos-orange transition-all"
              style={{ width: `${(mockUser.songsGenerated / mockUser.monthlyLimit) * 100}%` }}
            />
            {/* Scale ticks every 10% */}
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i} className="absolute inset-y-0 w-px bg-ink-0" style={{ left: `${(i + 1) * 10}%` }} aria-hidden />
            ))}
          </div>
          <p className="mt-3 font-mono text-[11px] text-fog-dim tabular-nums">{mockUser.monthlyLimit - mockUser.songsGenerated} songs remaining this month</p>
        </div>
      </section>

      {/* ── Tabs: mono labels, orange rule under the active one ─────── */}
      <div className="mt-10 sm:mt-14 mb-6 border-b border-line-soft overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex whitespace-nowrap min-w-max">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              aria-pressed={activeTab === tab}
              className={`h-12 px-4 first:pl-0 font-mono text-[11px] tracking-[0.16em] uppercase touch-manipulation transition-colors ${
                activeTab === tab
                  ? 'text-white'
                  : 'text-fog hoverable:hover:text-white'
              }`}
            >
              <span className="relative h-full flex items-center gap-2.5">
                <span className={`tabular-nums ${activeTab === tab ? 'text-melaos-orange' : 'text-fog-dim'}`} aria-hidden>{pad(i + 1)}</span>
                {tab}
                {activeTab === tab && <span className="absolute inset-x-0 bottom-0 h-px bg-melaos-orange" aria-hidden />}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* My Songs tab */}
      {activeTab === 'My Songs' && (
        <div className="border-t border-line-soft">
          {userSongs.map((song, i) => (
            <div
              key={song.id}
              className="group flex items-center gap-3 sm:gap-4 py-2 sm:px-3 border-b border-line-soft transition-colors hoverable:hover:bg-ink-1"
            >
              <span className="font-mono text-[11px] text-fog-dim tabular-nums w-5 shrink-0 hidden xs:block">{pad(i + 1)}</span>
              <div
                className="w-11 h-11 shrink-0 cursor-pointer relative overflow-hidden border border-line"
                style={{ background: song.coverGradient }}
                onClick={() => setCurrentSong(song)}
              >
                {song.coverArt && (
                  <img src={song.coverArt} alt={song.title} className="absolute inset-0 w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hoverable:group-hover:opacity-100 transition-opacity">
                  <Play className="w-3.5 h-3.5 text-melaos-orange fill-current" strokeWidth={0} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{song.title}</p>
                <p className="mt-1 font-mono text-[11px] text-fog-dim tabular-nums truncate">{song.genre} · {song.durationFormatted}</p>
              </div>
              {/* Play count and likes: hidden on small mobile */}
              <div className="hidden md:flex items-center gap-5 font-mono text-[11px] text-fog-dim tabular-nums">
                <span className="flex items-center gap-1.5"><Play className="w-3.5 h-3.5" strokeWidth={1.5} />{formatPlays(song.plays)}</span>
                <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" strokeWidth={1.5} />{formatPlays(song.likes)}</span>
                <span className="flex items-center gap-1.5 uppercase tracking-[0.14em]"><BarChart3 className="w-3.5 h-3.5" strokeWidth={1.5} />Analytics</span>
              </div>
              {/* Duration always visible on mobile */}
              <span className="font-mono text-[11px] text-fog-dim tabular-nums md:hidden shrink-0">{song.durationFormatted}</span>
              {/* Always visible on touch screens; on pointer screens they appear on row hover or focus */}
              <div className="flex items-center -mr-3 sm:mr-0 transition-opacity hoverable:opacity-0 hoverable:group-hover:opacity-100 hoverable:group-focus-within:opacity-100">
                <button className="touch-target text-fog-dim hoverable:hover:text-white transition-colors">
                  <Edit3 className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <button className="touch-target text-fog-dim hoverable:hover:text-melaos-hot transition-colors">
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <button className="touch-target text-fog-dim hoverable:hover:text-white transition-colors">
                  <MoreHorizontal className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Liked' && (
        likedSongs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line-soft border border-line-soft">
            {likedSongs.map(song => (
              <div key={song.id} className="cursor-pointer group bg-ink-0 p-3 sm:p-4 transition-colors hoverable:hover:bg-ink-1" onClick={() => setCurrentSong(song)}>
                <div className="aspect-square overflow-hidden mb-3 relative border border-line" style={{ background: song.coverGradient }}>
                  {song.coverArt && (
                    <img src={song.coverArt} alt={song.title} className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <span className="absolute bottom-2 right-2 btn btn-primary !min-h-[36px] !px-3 transition-opacity hoverable:opacity-0 hoverable:group-hover:opacity-100" aria-hidden>
                    <Play className="w-4 h-4 fill-current" strokeWidth={0} />
                  </span>
                </div>
                <p className="text-white text-sm font-medium truncate">{song.title}</p>
                <p className="mt-0.5 text-fog text-xs truncate">{song.artist}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative border border-line-soft py-16 px-6 flex flex-col items-center text-center overflow-hidden">
            <div className="absolute inset-0 rule-grid [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" aria-hidden />
            <Heart className="relative w-6 h-6 mb-4 text-fog-dim" strokeWidth={1.5} />
            <p className="relative text-fog text-sm max-w-sm leading-relaxed">No liked songs yet. Tap the heart on any track to save it here.</p>
          </div>
        )
      )}

      {activeTab === 'Playlists' && (
        mockPlaylists.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-line-soft border border-line-soft">
            {mockPlaylists.map(p => (
              <Link href="/library" key={p.id} className="group bg-ink-0 p-3 sm:p-4 transition-colors hoverable:hover:bg-ink-1">
                <div className="aspect-square mb-3 border border-line" style={{ background: p.gradient }} />
                <p className="text-white text-sm font-medium truncate transition-colors hoverable:group-hover:text-melaos-orange">{p.name}</p>
                <p className="mt-1 font-mono text-[11px] text-fog-dim tabular-nums">{p.count} songs</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border border-line-soft py-16 px-6 flex flex-col items-center text-center">
            <p className="display font-light text-white text-lg mb-6">No playlists yet.</p>
            <Link href="/studio" className="btn btn-primary">
              Create your first song
            </Link>
          </div>
        )
      )}

      {activeTab === 'Settings' && (
        <div className="max-w-2xl">
          <div className="border-t border-line-soft">
            {[
              { label: 'Display Name', value: mockUser.displayName },
              { label: 'Username', value: '@' + mockUser.username },
              { label: 'Email', value: 'your@email.com' },
            ].map(field => (
              <div key={field.label} className="grid sm:grid-cols-[180px_1fr] sm:items-center gap-2 sm:gap-6 py-4 border-b border-line-soft">
                <label className="label">{field.label}</label>
                <input
                  defaultValue={field.value}
                  className="field h-12"
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => { setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 2000); }}
            className="btn btn-primary mt-6 !min-h-[48px] !px-7 w-full xs:w-auto"
          >
            {settingsSaved ? 'Saved ✓' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}
