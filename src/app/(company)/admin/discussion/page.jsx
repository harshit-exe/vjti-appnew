'use client'
import ChatsPage from '@/components/chatsPage'
import { SlackChat } from '@/components/SlackChat'
import { checkToken } from '@/utils/getUserData'
import React, { useEffect, useState } from 'react'

const page = () => {
  //  let data =  await checkToken();
  //  console.log(data);
  const [data, setdata] = useState('')


  const fetchdata = async () => {
    let data = await checkToken();
    console.log(data);

    setdata(data);
  }

  useEffect(() => {
    fetchdata();
  }, [])


  return (<>
{/* 
  <div>
    {data?.user?.userName}
    <div>alsidhfli</div>
  </div> */}

  {data? <ChatsPage data={data?.user?.userName} />:''}
    {/* <ChatsPage data={data?.user?.userName} /> */}
  </>
  )
}

export default page