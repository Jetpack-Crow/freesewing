/*
 * This page is auto-generated. Do not edit it by hand.
 */
import { Jett } from 'designs/jett/src/index.mjs'
// Dependencies
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { nsMerge } from 'shared/utils.mjs'
// Components
import { PageWrapper, ns as pageNs } from 'shared/components/wrappers/page.mjs'
import { Workbench, ns as wbNs } from 'shared/components/workbench/new.mjs'
import { WorkbenchLayout } from 'site/components/layouts/workbench.mjs'

// Translation namespaces used on this page
const ns = nsMerge('jett', wbNs, pageNs)

const NewJettPage = ({ page, docs }) => (
  <PageWrapper {...page} title="Jett" layout={WorkbenchLayout} header={null}>
    <Workbench
      {...{
        design: 'jett',
        Design: Jett,
        docs,
      }}
    />
  </PageWrapper>
)

export default NewJettPage

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ns)),
      page: {
        locale,
        path: ['new', 'jett'],
        title: 'Jett',
      },
    },
  }
}
