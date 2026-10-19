import { createFileRoute } from '@tanstack/react-router'
import Main from '~/components/_ui/main'

export const Route = createFileRoute('/contact')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Main>Hello "/contact"!</Main>
}
