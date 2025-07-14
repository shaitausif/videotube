'use client'
import Image from "next/image";
import React, { useState } from "react";
import LogoutButton from "../../components/LogoutButton";

export default function Home() {

      const [file, setfile] = useState<File | null>()


      const onSubmit = async(e: React.FormEvent) => {
        e.preventDefault()
        if(!file) return;
        try {
          // this FormData will automatically set the headers and will handle all the multi part form uploading
          const data = new FormData()
          data.set("file",file)

          const res = await fetch('/api/upload',{
            method : "POST",
            body : data
          })

          if(!res.ok) throw new Error(await res.text())

        } catch (error) {
            console.error(error)
        }
      }

  return (

    <>
    <main>
      <form onSubmit={onSubmit} >
        <input accept="image/*" type="file" name="file" onChange={(e) => setfile(e.target.files?.[0])} />

        <button type="submit">Upload</button>

        <br />
        <LogoutButton />
      </form>
    </main>
    </>
  );
}
