'use client'
import { useState, useEffect, useRef } from 'react'
import { io } from "socket.io-client"
import Peer from 'peerjs'
import { myWebcam, yourWebcam } from '@/function/webcam'
export default function Home() {


  const [socket, setSocket] = useState<any>()

  const [notice, setNotice] = useState<string>("")

  const [name, setName] = useState<string>("")
  const [room, setRoom] = useState<string>("one")

  const [msg, setMsg] = useState<string>("")
  const [receivedMsg, setReceiverMsg] = useState<any>()
  const [arrayMsg, setArrayMsg] = useState<any>([])

  const [inRoom, setInRoom] = useState<boolean>(false)

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);
  const [videocallOpen, setVideoCallOpen] = useState<boolean>(false)


  const [stream, setStream] = useState<MediaStream | null>(null);
  const [clientstream, setClientStream] = useState<MediaStream | null>(null);
  useEffect(() => {
    const socket = io("")
    setSocket(socket)

    socket.on("messageMe", (data: any) => {
      if (data.type === "note") {
        setNotice(data.msg + " " + data.room)
        setTimeout(() => {
          setNotice("")
        }, 3000)
      }
      if (data.type === "msg") {
        setReceiverMsg(data)
      }
    })

    socket.on("messageYou", (data: any) => {
      if (data.type === "note") {
        setNotice(data.name + " " + data.msg)
        setTimeout(() => {
          setNotice("")
        }, 3000)
      }
      if (data.type === "msg") {
        setReceiverMsg(data)
      }
    })

    socket.on("webYou", async (data: any) => {
      let packagedData = JSON.parse(data.myStream);
      const newStream = await yourWebcam(packagedData)

      videoRef2 && videoRef2.current ? videoRef2.current.srcObject = newStream : null
      setClientStream(newStream)
      setVideoCallOpen(true)

    })

    return () => { socket.disconnect() }
  }, [])

  useEffect(() => {
    receivedMsg && setArrayMsg([...arrayMsg, receivedMsg])
  }, [receivedMsg])

  const enterRoom = () => {
    setInRoom(true)
    socket.emit("enter", { name, room })
  }

  const leaveRoom = () => {
    setInRoom(false)
    socket.emit("leave", { name, room })
  }

  const sendMsg = () => {
    msg.length && socket.emit("send msg", { name, room, msg })
    setMsg("")
  }

  const openWebcam = async () => {
    const currentStream: MediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const myStream = myWebcam(currentStream)
    socket.emit("onWebcam", { myStream, room })
    videoRef && videoRef.current ? videoRef.current.srcObject = currentStream : null
    setStream(currentStream)
    setVideoCallOpen(true)
  }

  const closeWebcam = async () => {
    const tracks = stream?.getTracks();
    tracks && tracks.forEach((track: any) => track.stop());
    // setVideoCallOpen(false)
  }


  return (
    <main>
      {!inRoom ? <div className="enterPath">
        <h1>welcome to my chat</h1>
        <input placeholder='username' value={name} onChange={(e) => setName(e.target.value)}></input><br></br>
        <p>room : <select placeholder='room' value={room} onChange={(e) => setRoom(e.target.value)}>
          <option>one</option>
          <option>two</option>
          <option>three</option>
        </select>
        </p>
        <br></br>
        {name && <button onClick={() => enterRoom()}>enter</button>}
      </div> :
        <div className="roomPath">
          <p>room: {room} <button onClick={() => leaveRoom()}>leave</button></p>
          <div className="msgBox">
            <p>{notice}</p>
            <button onClick={() => openWebcam()}>webcam</button>
            {arrayMsg.map((item: any, index: number) => <p className={`item ${item.sender ? "sender" : ""}`} key={index}><span>{item.name}</span><br></br>{item.msg}</p>)}
          </div>
          <div className="inputBox">
            <textarea placeholder='message' value={msg} onChange={(e) => setMsg(e.target.value)}></textarea>
            <button onClick={() => sendMsg()}>send</button>
          </div>

        </div>
      }
      <div className={`videocall ${videocallOpen ? "videocallOpen" : ""}`}>
        <button onClick={() => closeWebcam()}>close webcam</button>
        <video ref={videoRef} autoPlay playsInline />
        <video ref={videoRef2} autoPlay playsInline />
      </div>
    </main>
  )
}
