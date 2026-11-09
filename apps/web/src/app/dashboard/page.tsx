'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Play, Heart, MoreHorizontal, Plus, Trash2, Edit3, BarChart3, ListMusic } from 'lucide-react';
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

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('My Songs');
  const [settingsSaved, setSettingsSaved] = useState(false);
  const { setCurrentSong, likedIds } = useAudioStore();
  const userSongs = mockSongs.slice(0, 8);
  const likedSongs = mockSongs.filter(s => likedIds.includes(s.id));

  return (
    <div className="mx-auto max-w-[1280px] px-safe md:px-8 py-6 sm:py-10">
      {/* ── Creator profile ────────────────────────────────────────────
          Phones: avatar beside the name, then stats, then the action.
          Tablets up: the avatar sits left of all three. Computers: the
          monthly usage card sits to the right. */}
      <section className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:items-center lg:gap-10">
        <div className="brand-glow -top-24 -left-28 w-[520px] h-[300px] opacity-30" aria-hidden />

        <div className="relative grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 sm:gap-x-6 gap-y-5 sm:gap-y-4">
          <div className="sm:row-span-3 w-20 h-20 sm:w-28 sm:h-28 xl:w-32 xl:h-32 rounded-full bg-brand flex items-center justify-center display text-2xl sm:text-[2rem] xl:text-[2.4rem] text-white shadow-[0_12px_40px_rgba(233,30,140,0.35)] select-none">
            FR
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-x-2.5 gap-y-1.5 flex-wrap">
              <h1 className="display text-white leading-[1.1] text-2xl sm:text-3xl xl:text-4xl min-w-0 break-words">{mockUser.displayName}</h1>
              <span className="tag tag-orange">{mockUser.tier}</span>
            </div>
            <p className="mt-1 text-fog text-sm sm:text-[15px] truncate">@{mockUser.username}</p>
          </div>

          {/* Big numbers, small labels */}
          <dl className="col-span-2 sm:col-span-1 sm:col-start-2 grid grid-cols-3 gap-3 sm:flex sm:gap-8">
            {[
              ['Followers', mockUser.followerCount.toLocaleString()],
              ['Following', mockUser.followingCount],
              ['Songs', userSongs.length],
            ].map(([name, value]) => (
              <div key={name} className="flex flex-col-reverse min-w-0">
                <dt className="mt-1 text-xs sm:text-[13px] text-fog">{name}</dt>
                <dd className="display text-xl sm:text-2xl text-white tabular-nums leading-none truncate">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="col-span-2 sm:col-span-1 sm:col-start-2">
            <Link href="/studio" className="btn btn-primary w-full sm:w-auto !px-6">
              <Plus className="w-4 h-4" strokeWidth={2.25} /> New Song
            </Link>
          </div>
        </div>

        {/* Monthly usage */}
        <div className="relative panel p-5">
          <p className="text-white text-sm font-semibold">Monthly usage</p>
          <p className="mt-2 text-fog text-sm tabular-nums">
            <span className="display text-3xl text-white">{mockUser.songsGenerated}</span> / {mockUser.monthlyLimit} songs
          </p>
          <div className="mt-4 h-2.5 rounded-full bg-ink-4 overflow-hidden">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${(mockUser.songsGenerated / mockUser.monthlyLimit) * 100}%` }}
            />
          </div>
          <p className="mt-3 text-[13px] text-fog tabular-nums">{mockUser.monthlyLimit - mockUser.songsGenerated} songs remaining this month</p>
        </div>
      </section>

      {/* ── Tabs: pill segmented control ───────────────────────────── */}
      <div className="mt-8 sm:mt-10 mb-5 sm:mb-6 -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto scrollbar-hide">
        <div className="flex w-full min-w-max sm:inline-flex sm:w-auto rounded-full bg-ink-2 border border-line-soft p-1">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              aria-pressed={activeTab === tab}
              className={`flex-1 sm:flex-none h-11 px-3 sm:px-5 rounded-full text-[13px] sm:text-sm font-semibold whitespace-nowrap touch-manipulation transition-colors ${
                activeTab === tab
                  ? 'bg-white text-[#08080A]'
                  : 'text-fog hoverable:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* My Songs tab */}
      {activeTab === 'My Songs' && (
        <div className="-mx-2 sm:mx-0 sm:p-2 sm:rounded-card sm:bg-ink-2 sm:border sm:border-line-soft">
          {userSongs.map((song, i) => (
            <div
              key={song.id}
              className="group flex items-center gap-3 sm:gap-4 px-2 sm:px-3 py-2 rounded-[14px] transition-colors hoverable:hover:bg-ink-3"
            >
              <span className="hidden sm:block w-5 shrink-0 text-center text-sm font-bold text-fog-dim tabular-nums">{i + 1}</span>
              <div
                className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 cursor-pointer relative overflow-hidden rounded-[10px]"
                style={{ background: song.coverGradient }}
                onClick={() => setCurrentSong(song)}
              >
                {song.coverArt && (
                  <img src={song.coverArt} alt={song.title} className="absolute inset-0 w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 hoverable:group-hover:opacity-100 transition-opacity">
                  <Play className="w-4 h-4 text-white fill-current" strokeWidth={0} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm sm:text-[15px] font-semibold truncate">{song.title}</p>
                <p className="mt-0.5 text-fog text-xs sm:text-[13px] truncate">{song.genre} · {song.durationFormatted}</p>
              </div>
              {/* Play count and likes: hidden on small mobile */}
              <div className="hidden md:flex items-center gap-5 text-xs text-fog tabular-nums">
                <span className="flex items-center gap-1.5"><Play className="w-3 h-3 fill-current" strokeWidth={0} />{formatPlays(song.plays)}</span>
                <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" strokeWidth={2} />{formatPlays(song.likes)}</span>
                <span className="flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" strokeWidth={2} />Analytics</span>
              </div>
              {/* Duration always visible on mobile */}
              <span className="text-xs text-fog tabular-nums md:hidden shrink-0">{song.durationFormatted}</span>
              {/* Always visible on touch screens; on pointer screens they appear on row hover or focus */}
              <div className="flex items-center -mr-2 sm:mr-0 transition-opacity hoverable:opacity-0 hoverable:group-hover:opacity-100 hoverable:group-focus-within:opacity-100">
                <button className="touch-target rounded-full text-fog transition-colors hoverable:hover:text-white hoverable:hover:bg-white/[0.06]">
                  <Edit3 className="w-4 h-4" strokeWidth={2} />
                </button>
                <button className="touch-target rounded-full text-fog transition-colors hoverable:hover:text-melaos-hot hoverable:hover:bg-white/[0.06]">
                  <Trash2 className="w-4 h-4" strokeWidth={2} />
                </button>
                <button className="touch-target rounded-full text-fog transition-colors hoverable:hover:text-white hoverable:hover:bg-white/[0.06]">
                  <MoreHorizontal className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Liked' && (
        likedSongs.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-3 sm:gap-x-4 gap-y-5 sm:gap-y-6">
            {likedSongs.map(song => (
              <div key={song.id} className="cursor-pointer group min-w-0" onClick={() => setCurrentSong(song)}>
                <div className="aspect-square rounded-2xl overflow-hidden relative" style={{ background: song.coverGradient }}>
                  {song.coverArt && (
                    <img src={song.coverArt} alt={song.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hoverable:group-hover:scale-[1.04]" />
                  )}
                  <span
                    className="absolute bottom-2.5 right-2.5 w-11 h-11 rounded-full bg-brand flex items-center justify-center text-white shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-all duration-200 hoverable:opacity-0 hoverable:translate-y-1.5 hoverable:group-hover:opacity-100 hoverable:group-hover:translate-y-0"
                    aria-hidden
                  >
                    <Play className="w-4 h-4 ml-0.5 fill-current" strokeWidth={0} />
                  </span>
                </div>
                <p className="mt-2.5 text-white text-sm font-semibold truncate">{song.title}</p>
                <p className="mt-0.5 text-fog text-xs sm:text-[13px] truncate">{song.artist}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="panel py-14 sm:py-16 px-6 flex flex-col items-center text-center">
            <span className="w-14 h-14 mb-4 rounded-full bg-melaos-pink/15 text-melaos-pink flex items-center justify-center">
              <Heart className="w-6 h-6" strokeWidth={2} />
            </span>
            <p className="text-fog text-sm sm:text-[15px] max-w-sm leading-relaxed">No liked songs yet. Tap the heart on any track to save it here.</p>
          </div>
        )
      )}

      {activeTab === 'Playlists' && (
        mockPlaylists.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-3 sm:gap-x-4 gap-y-5 sm:gap-y-6">
            {mockPlaylists.map(p => (
              <Link href="/library" key={p.id} className="group min-w-0 rounded-2xl">
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <div
                    className="w-full h-full flex items-center justify-center transition-transform duration-300 hoverable:group-hover:scale-[1.04]"
                    style={{ background: p.gradient }}
                  >
                    <ListMusic className="w-9 h-9 text-white/80" strokeWidth={2} aria-hidden />
                  </div>
                </div>
                <p className="mt-2.5 text-white text-sm font-semibold truncate">{p.name}</p>
                <p className="mt-0.5 text-fog text-xs sm:text-[13px] tabular-nums">{p.count} songs</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="panel py-14 sm:py-16 px-6 flex flex-col items-center text-center">
            <p className="display text-white text-xl sm:text-2xl mb-5">No playlists yet.</p>
            <Link href="/studio" className="btn btn-primary !px-6">
              Create your first song
            </Link>
          </div>
        )
      )}

      {activeTab === 'Settings' && (
        <div className="max-w-xl panel p-5 sm:p-7">
          <div className="space-y-5">
            {[
              { label: 'Display Name', value: mockUser.displayName },
              { label: 'Username', value: '@' + mockUser.username },
              { label: 'Email', value: 'your@email.com' },
            ].map(field => (
              <div key={field.label}>
                <label className="label block mb-2">{field.label}</label>
                <input
                  defaultValue={field.value}
                  className="field h-12"
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => { setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 2000); }}
            className="btn btn-primary mt-7 !min-h-[48px] !px-7 w-full sm:w-auto"
          >
            {settingsSaved ? 'Saved ✓' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}
