import { createFileRoute } from '@tanstack/react-router'
import Main from '~/components/_ui/main'

export const Route = createFileRoute('/photography')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Main>Hello "/photography"!</Main>
}
