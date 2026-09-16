
import React from 'react'
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {variant?: 'primary'|'ghost'|'gradient', size?: 'sm'|'md'|'lg'}
export function Button({variant='primary', size='md', className='', children, ...props}:Props){
  const base = "font-jakarta font-semibold rounded-[12px] transition inline-flex items-center justify-center"
  const sizes = {sm:"h-8 px-3 text-[13px]", md:"h-10 px-4 text-[14px]", lg:"h-11 px-5 text-[15px]"}[size]
  const variants = {
    primary: "bg-[#FAFAFA] text-[#0A0A0B] hover:bg-white",
    ghost: "bg-transparent border border-[var(--border)] text-[var(--text-mute)] hover:text-[var(--text)] hover:border-[var(--border-hover)]",
    gradient: "text-white bg-[var(--gradient)] hover:opacity-90"
  }[variant]
  return <button className={`${base} ${sizes} ${variants} ${className}`} {...props}>{children}</button>
}
