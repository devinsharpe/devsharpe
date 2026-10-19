import { createFileRoute } from '@tanstack/react-router'
import Main from '~/components/_ui/main'

export const Route = createFileRoute('/projects/$slug')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Main>Hello "/project/$slug"!</Main>
}
