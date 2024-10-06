import React from 'react';

export default function Pill({ type = "Easy", data }) {
    const variants = {
        Easy:"py-1 px-2 text-xs rounded-xl inline-block whitespace-nowrap text-center bg-lime-200 text-lime-700 align-baseline font-semibold leading-none",
        Medium: "py-1 px-2 text-xs rounded-xl inline-block whitespace-nowrap text-center bg-orange-50 text-amber-600 align-baseline font-semibold leading-none",
        Hard: "py-1 px-2 text-xs rounded-xl inline-block whitespace-nowrap text-center bg-red-200 text-red-700 align-baseline font-semibold leading-none",
        topic: "py-1 px-2 text-xs rounded-xl inline-block whitespace-nowrap text-center bg-slate-200 text-slate-900 align-baseline font-semibold leading-none" 
    }

    const variant = variants[type]
    return (
        <span className={`${variant}`}>{data}</span>
    )
}
