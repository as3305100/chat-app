import { useState, useEffect, useCallback, useRef } from 'react'

function App() {

  interface Message {
    type: "sent" | "received";
    message: string;
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [talkTo, setTalkTo] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null)
  const msgRef = useRef<HTMLInputElement>(null)

  const [id, setId] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null);



  function handleTalkTo() {
    if (inputRef.current) {
      const value = inputRef.current.value;
      setTalkTo(value)
    }
  }

  function sendMessage() {
    if (msgRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current?.send(JSON.stringify({
        type: "chat",
        payload: {
          message: msgRef.current.value,
          talkToId: talkTo,
        }
      }))
      setMessages([...messages, { type: "sent", message: msgRef.current.value }]);
      msgRef.current.value = ""
    }
  }

  const generateRandomId = useCallback(() => {
    let str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randomId = "";
    for (let i = 0; i < 6; i++) {
      randomId += str.charAt(Math.floor(Math.random() * str.length));
    }
    return randomId;
  }, [])

  useEffect(() => {

    if (id === null) {
      setId(generateRandomId())
    }

    if(!id) return;

    wsRef.current = new WebSocket("ws://localhost:8000");


    wsRef.current.onopen = () => {
      wsRef.current?.send(JSON.stringify({
        type: "join",
        payload: { ownId: id }
      }));
    };

    wsRef.current.onmessage = (e) => {
      setMessages(prevMessages => [...prevMessages, { type: "received", message: e.data }]);
    };


    return () => {
      wsRef.current?.close();
    };

  }, [id])


  return (
    <div className='min-h-screen flex justify-center items-center bg-gray-500'>
      {/* Header */}
      <div className="max-w-[700px] w-full text-white bg-gray-950 p-4 rounded-lg shadow-lg">
        <div className="flex bg-gray-600 justify-between items-center p-3 rounded">
          {/* @ts-ignore */}
          <h2 className='text-2xl font-medium'>Your Id : {id}</h2>
          <div className='flex items-center'>
            <input type="text" ref={inputRef} className='p-2 mr-2 outline-none focus:none bg-white text-black text-lg rounded-lg' />
            <button className='bg-orange-600 p-2 text-lg rounded-lg cursor-pointer' onClick={handleTalkTo}>Set Talk To</button>
          </div>
        </div>

        {/* messages section */}

        <div className='min-h-[500px] bg-gray-700 mt-2'>

          {
            messages.length > 0 ? messages.map((item, index) => (
              <div key={index} className={`mt-1 p-3 ${item.type === "sent" ? "text-right" : "text-left"}`}>
                <span className="bg-white text-black rounded p-2">{item.message}</span>
              </div>
            )) : null
          }

        </div>

        {/* sending message section */}

        <div className="mt-3 flex">
          <input
            ref={msgRef}
            type="text"
            placeholder='Enter Your Message'
            className='bg-white max-w-[80%] w-full p-2 focus:none outline-none text-lg rounded-lg placeholder-red-600 text-black'
          />

          <button
            className="bg-red-500 grow text-lg font-medium text-white rounded-md cursor-pointer hover:bg-blue-600 hover:text-gray-400 duration-400"
            disabled={talkTo === null}
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
