'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Layers3, LayoutGrid, ChartNoAxesColumn, BookOpen, Sun, Moon } from 'lucide-react'
const links=[{href:'/',label:'Início',Icon:LayoutGrid},{href:'/uso',label:'Uso',Icon:ChartNoAxesColumn},{href:'/documentacao',label:'Documentação',Icon:BookOpen}]
export function AppHeader({initialLight}:{initialLight:boolean}){const path=usePathname();const [light,setLight]=useState(initialLight);return <header><div className="top wrap"><Link href="/" className="brand" aria-label="Gutenberg Systems, início"><span className="brand-icon"><Layers3 size={25}/></span><span>Gutenberg<small>SYSTEMS</small></span></Link><nav aria-label="Principal">{links.map(({href,label,Icon})=><Link key={href} href={href} aria-current={path===href?'page':undefined}><Icon size={16}/>{label}</Link>)}</nav><button className="theme" aria-label={`Ativar tema ${light?'escuro':'claro'}`} title={`Ativar tema ${light?'escuro':'claro'}`} onClick={()=>{document.documentElement.dataset.theme=light?'dark':'light';document.cookie=`portal-theme=${light?'dark':'light'}; Path=/; Max-Age=31536000; SameSite=Lax`;setLight(!light)}}>{light?<Moon size={17}/>:<Sun size={17}/>}</button></div></header>}
export function AppFooter(){return <footer className="wrap"><span><Layers3 size={16}/> Gutenberg Systems</span><small>Projeto demonstrativo · Empresa e pedidos fictícios</small></footer>}
