import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import { AppHeader, AppFooter } from '@/components/app-shell'
import './globals.css'
export const metadata:Metadata={title:{default:'API de Pedidos · Gutenberg Systems',template:'%s · Gutenberg Systems'},description:'Portal público da API de Pedidos: documentação, consumo e métricas de processamento de pedidos de compra.'}
export const viewport:Viewport={colorScheme:'dark light',themeColor:'#101110'}
export default async function RootLayout({children}:{children:React.ReactNode}){const light=(await cookies()).get('portal-theme')?.value==='light';return <html lang="pt-BR" data-theme={light?'light':'dark'}><body><a href="#conteudo" className="skip">Pular para o conteúdo</a><AppHeader initialLight={light}/><main tabIndex={-1} id="conteudo" className="wrap">{children}</main><AppFooter/></body></html>}
