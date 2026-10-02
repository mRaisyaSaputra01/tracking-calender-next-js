import Link from 'next/link'
import { Calendar } from '@/app/component/render-calendar'
import { Clock } from '@/app/component/update-clock' 
import { Todolist } from '@/app/component/todolist'

import { SpeedInsights } from "@vercel/speed-insights/next"

const Page = () => {

  return (
    <div className="main">
      <section className="calendar-container">

        <Calendar />

      </section>

      <aside>

        <Clock />

        <Todolist />        

      </aside>
    </div>

  )
}

export default Page