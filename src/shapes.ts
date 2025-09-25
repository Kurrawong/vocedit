import n3 from 'n3'

const { namedNode } = n3.DataFactory

export const conceptSchemeShape = namedNode(
  'https://linked.data.gov.au/def/vocpub/validator/Shui-ConceptScheme',
)
export const collectionShape = namedNode(
  'https://linked.data.gov.au/def/vocpub/validator/Shui-Collection',
)
export const conceptShape = namedNode(
  'https://linked.data.gov.au/def/vocpub/validator/Shui-Concept',
)
