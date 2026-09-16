
import React from 'react'
export function Card({children, className='', active=false, ...props}:React.HTMLAttributes<HTMLDivElement> & {active?:boolean}){
  return <div className={`${active?'card-cf-active':'card-cf'} p-5 ${className}`} {...props}>{children}</div>
}
export function CardHeader({children, className=''}:any){ return <div className={`font-mono text-[10px] uppercase tracking-widest opacity-50 mb-3 ${className}`}>{children}</div>}
