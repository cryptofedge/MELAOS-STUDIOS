'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Play, Heart, MoreHorizontal, Plus, Trash2, Edit3, BarChart3 } from 'lucide-react';
import { mockSongs, formatPlays } from '@/lib/mockData';
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
  const { setCurrentSong } = useAudioStore();
  const userSongs = mockSongs.slice(0, 8);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="flex items-start gap-6 mb-8 p-6 bg-[#1A1A1A] border border-[#333] rounded-2xl">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F28C28] to-[#E91E8C] flex items-center justify-center text-white text-2xl font-black shrink-0">
          FR
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h1 className="text-2xl font-black text-white">{mockUser.displayName}</h1>
            <span className="bg-[#F28C28]/20 text-[#F28C28] text-xs font-bold px-2 py-0.5 rounded-full border border-[#F28C28]/30">
              {mockUser.tier}
            </span>
          </div>
          <p className="text-gray-500 text-sm mb-3">@{mockUser.username}</p>
          <div className="flex gap-6 text-sm">
            <span><strong className="text-white">{mockUser.followerCount.toLocaleString()}</strong> <span className="text-gray-500">Followers</span></span>
            <span><strong className="text-white">{mockUser.followingCount}</strong> <span className="text-gray-500">Following</span></span>
            <span><strong className="text-white">{userSongs.length}</strong> <span className="text-gray-500">Songs</span></span>
          </div>
        </div>
        <Link href="/studio" className="btn-orange text-white text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-2 shrink-0 hover:scale-105 transition-transform">
          <Plus className="w-4 h-4" /> New Song
        </Link>
      </div>

      {/* Usage quota */}
      <div className="mb-8 p-4 bg-[#1A1A1A] border border-[#333] rounded-xl">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-300">Monthly usage</span>
          <span className="text-sm text-gray-500">{mockUser.songsGenerated} / {mockUser.monthlyLimit} songs</span>
        </div>
        <div className="h-2 bg-[#333] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#F28C28] to-[#E91E8C] transition-all"
            style={{ width: `${(mockUser.songsGenerated / mockUser.monthlyLimit) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1.5">{mockUser.monthlyLimit - mockUser.songsGenerated} songs remaining this month</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[#1A1A1A] pb-4">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === tab
                ? 'bg-[#F28C28] text-white'
                : 'text-gray-500 hover:text-gray-300 hover:bg-[#1A1A1A]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* My Songs tab */}
      {activeTab === 'My Songs' && (
        <div className="space-y-2">
          {userSongs.map((song, i) => (
            <div
              key={song.id}
              className="group flex items-center gap-4 p-3 bg-[#1A1A1A] border border-[#222] rounded-xl hover:border-[#333] transition-all"
            >
              <span className="text-gray-700 text-sm w-5 text-right shrink-0">{i + 1}</span>
              <div
                className="w-10 h-10 rounded-lg shrink-0 cursor-pointer relative overflow-hidden hover:scale-105 transition-transform"
                style={{ background: song.coverGradient }}
                onClick={() => setCurrentSong(song as any)}
              >
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-3 h-3 text-white" fill="white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{song.title}</p>
                <p className="text-gray-600 text-xs">{song.genre} · {song.durationFormatted}</p>
              </div>
              <div className="hidden md:flex items-center gap-4 text-xs text-gray-600">
                <span className="flex items-center gap-1"><Play className="w-3 h-3" />{formatPlays(song.plays)}</span>
                <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{formatPlays(song.likes)}</span>
                <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" />Analytics</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 text-gray-600 hover:text-blue-400 rounded transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 text-gray-600 hover:text-red-400 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 text-gray-600 hover:text-white rounded transition-colors"><MoreHorizontal className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Liked' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mockSongs.slice(2, 8).map(song => (
            <div key={song.id} className="cursor-pointer group" onClick={() => setCurrentSong(song as any)}>
              <div className="aspect-square rounded-xl overflow-hidden mb-2 relative" style={{ background: song.coverGradient }}>
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-6 h-6 text-white" fill="white" />
                </div>
              </div>
              <p className="text-white text-sm font-semibold truncate">{song.title}</p>
              <p className="text-gray-500 text-xs">{song.artist}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Playlists' && (
        <div className="text-center py-16 text-gray-600">
          <p className="text-lg mb-4">No playlists yet.</p>
          <Link href="/studio" className="btn-orange text-white text-sm font-semibold px-6 py-2 rounded-full inline-block hover:scale-105 transition-transform">
            Create your first song
          </Link>
        </div>
      )}

      {activeTab === 'Settings' && (
        <div className="max-w-lg space-y-4">
          {[
            { label: 'Display Name', value: mockUser.displayName },
            { label: 'Username', value: '@' + mockUser.username },
            { label: 'Email', value: 'your@email.com' },
          ].map(field => (
            <div key={field.label}>
              <label className="text-xs text-gray-500 font-medium mb-1 block">{field.label}</label>
              <input
                defaultValue={field.value}
                className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2.5 text-gray-300 text-sm focus:outline-none focus:border-[#F28C28] transition-colors"
              />
            </div>
          ))}
          <button className="btn-orange text-white text-sm font-bold px-6 py-2.5 rounded-full hover:scale-105 transition-transform">
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
