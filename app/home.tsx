"use client"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center max-w-[1200px] mx-auto px-4 py-2">
      {/* Logo container */}
      <div className="flex justify-end items-center w-full pb-10">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-rYTABolBUBWveDJBn941qJSCd8oH9V.png"
          alt="ERGOSIGN"
          width="157"
        />
      </div>

      {/* Main heading */}
      <h1 className="text-center text-[48px] leading-[60px] font-normal mb-10 font-['Open_Sans']">
        Psychologisch fundierte <br />
        CX Guidelines für bessere Conversion
      </h1>

      {/* Subheading */}
      <p className="text-center text-[20px] leading-[26px] text-[#797979] max-w-[640px] font-['Open_Sans']">
        Eine umfassende Sammlung von über 220 evidenzbasierten psychologischen Prinzipien und über 100
        praxisorientierten <br />
        Guidelines für die Verbesserung der Conversion und die Gestaltung einer herausragenden Customer Experience
      </p>

      {/* Buttons */}
      <div className="flex mt-5">
        <button
          onClick={() => router.push("/?skipHome=true")}
          className="bg-black text-white rounded-[20px] mx-2 px-4 py-3 text-[18px] font-['Open_Sans']"
        >
          Guidelines öffnen
        </button>
        <button className="bg-white text-black border-2 border-black rounded-[20px] mx-2 px-3 py-[10px] text-[18px] font-['Open_Sans']">
          Training buchen
        </button>
      </div>

      {/* Screenshot */}
      <div className="mt-[60px]">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Guidelines-p-2000-VY7IIC4gvLDlxIm6vstWWmAOOKFxzu.png"
          alt="CX Guidelines Interface"
          className="w-full shadow-[0_2px_20px_rgba(0,0,0,0.2)] pt-[13px]"
        />
      </div>
    </div>
  )
}
