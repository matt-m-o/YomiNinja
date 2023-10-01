import Link from 'next/link'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { User } from '../interfaces'
import { findAll } from '../utils/sample-api'

type Props = {
  items: User[]
  pathname: string
}

const WithInitialProps = ({ items }: Props) => {
  const router = useRouter()
  return (
    <div>
      <h1>List Example (as Function Component)</h1>
      <p>You are currently on: {router.pathname}</p>      
      <p>
        <Link href="/">Go home</Link>
      </p>
    </div>
  )
}

export async function getStaticProps() {
  const items: User[] = await findAll()

  return { props: { items } }
}

export default WithInitialProps
