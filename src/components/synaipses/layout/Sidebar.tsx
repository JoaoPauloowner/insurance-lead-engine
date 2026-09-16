
'use client'
import React from 'react'

const nav = {
  GERAL: [
    {id:'dashboard', label:'Dashboard', icon:'◧', active:true},
    {id:'estatisticas', label:'Estatísticas', icon:'◫', badge:'12% ↑', badgeType:'success'},
    {id:'relatorios', label:'Relatórios', icon:'◨'},
  ],
  OPERACAO: [
    {id:'chat', label:'Chat ao vivo', icon:'◐', badge:'3 ao vivo', badgeType:'orange', active:false},
    {id:'automacoes', label:'Automações', icon:'⚡'},
    {id:'conversas', label:'Conversas', icon:'◑', count:'47'},
  ],
  INTELIGENCIA: [
    {id:'conhecimento', label:'Conhecimento Base', icon:'◫'},
    {id:'catalogo', label:'Catálogo', icon:'⬢'},
  ]
}

export function Sidebar(){
  return (
    <aside style={{width:'var(--sidebar-w)', background:'#0E0E10', borderRight:'1px solid var(--border)'}} className="h-screen flex flex-col sticky top-0">
      <div className="p-5 border-b border-[var(--border)] flex items-center gap-3">
        <div className="w-8 h-8 bg-white text-black rounded-[8px] flex items-center justify-center font-sora font-bold text-[13px]">S</div>
        <div><div className="font-sora font-bold text-[14px]">SynAIpses</div><div className="font-mono text-[10px] opacity-50">CentralFlow Edition</div></div>
      </div>
      <div className="p-3">
        <div className="h-9 bg-[var(--surface-2)] border border-[var(--border)] rounded-[10px] flex items-center px-3 gap-2 text-[13px] text-[var(--text-mute)]">⌕ Buscar... <span className="ml-auto font-mono text-[10px] border border-[var(--border)] px-1 rounded">⌘K</span></div>
      </div>
      <div className="flex-1 overflow-auto px-3 space-y-6 py-3">
        {Object.entries(nav).map(([group, items])=>(
          <div key={group}>
            <div className="font-mono text-[10px] uppercase tracking-widest opacity-40 px-2 mb-2">{group}</div>
            <div className="space-y-1">
              {items.map((item:any)=>(
                <div key={item.id} className={`h-9 flex items-center gap-3 px-2.5 rounded-[10px] text-[13.5px] cursor-pointer transition ${item.active?'bg-[#1E1B2E] text-white border border-[#8B5CF633]': 'text-[var(--text-mute)] hover:bg-[var(--surface-2)] hover:text-white'}`}>
                  <span className="text-[14px]">{item.icon}</span>
                  <span className="font-jakarta flex-1">{item.label}</span>
                  {item.badge && <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${item.badgeType==='orange'?'bg-[#FF7A451A] text-[#FF7A45]':'bg-[#0AFF921A] text-[#0AFF92]'}`}>{item.badge}</span>}
                  {item.count && <span className="font-mono text-[11px] opacity-50">{item.count}</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="p-3">
        <div className="rounded-[16px] p-4 border border-[#8B5CF633] bg-gradient-to-br from-[#8B5CF61A] to-[#FF7A451A]">
          <div className="font-sora font-semibold text-[13px]">81% mais rápido</div>
          <div className="font-jakarta text-[11px] opacity-60 mt-1">com automação ativa</div>
          <button className="mt-3 w-full h-8 rounded-[8px] bg-white text-black font-semibold text-[12px]">Ver upgrade</button>
        </div>
      </div>
    </aside>
  )
}
