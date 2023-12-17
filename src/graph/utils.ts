import dayjs from 'dayjs'

export async function callQuery(query: string, subgraph: string) {
    try {
        const response = await fetch(subgraph, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        })
        const json = await response.json()
        return json
    } catch (error) {
        console.log(error)
    }
}

export const get2DayChange = (valueNow: string, value24HoursAgo: string, value48HoursAgo: string): [number, number] => {
  // get volume info for both 24 hour periods
  const currentChange = parseFloat(valueNow) - parseFloat(value24HoursAgo)
  const previousChange = parseFloat(value24HoursAgo) - parseFloat(value48HoursAgo)
  const adjustedPercentChange = ((currentChange - previousChange) / previousChange) * 100
  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return [currentChange, 0]
  }
  return [currentChange, adjustedPercentChange]
}

export function useDeltaTimestamps(): [number, number, number] {
  const utcCurrentTime = dayjs()
  const t1 = utcCurrentTime.subtract(1, 'day').startOf('minute').unix()
  const t2 = utcCurrentTime.subtract(2, 'day').startOf('minute').unix()
  const tWeek = utcCurrentTime.subtract(1, 'week').startOf('minute').unix()
  return [t1, t2, tWeek]
}

// export function useBlocksFromTimestamps(
//   timestamps: number[],
// ): {
//   blocks:
//     | {
//         timestamp: string
//         number: any
//       }[]
//     | undefined
//   error: boolean
// } {
//   // const [activeNetwork] = useActiveNetworkVersion()
//   // const [blocks, setBlocks] = useState<any>()
//   // const [error, setError] = useState(false)
//
//   // const { blockClient } = useClients()
//   // const activeBlockClient = blockClientOverride ?? blockClient
//
//   // derive blocks based on active network
//   // const networkBlocks = blocks?.[activeNetwork.id]
//
//   useEffect(() => {
//     async function fetchData() {
//       const results = await splitQuery(GET_BLOCKS, activeBlockClient, [], timestamps)
//       if (results) {
//         setBlocks({ ...(blocks ?? {}), [activeNetwork.id]: results })
//       } else {
//         setError(true)
//       }
//     }
//     if (!networkBlocks && !error) {
//       fetchData()
//     }
//   })
//
//   const blocksFormatted = useMemo(() => {
//     if (blocks?.[activeNetwork.id]) {
//       const networkBlocks = blocks?.[activeNetwork.id]
//       const formatted = []
//       for (const t in networkBlocks) {
//         if (networkBlocks[t].length > 0) {
//           const number = networkBlocks[t][0]['number']
//           const deploymentBlock = START_BLOCKS[activeNetwork.id]
//           const adjustedNumber = number > deploymentBlock ? number : deploymentBlock
//
//           formatted.push({
//             timestamp: t.split('t')[1],
//             number: adjustedNumber,
//           })
//         }
//       }
//       return formatted
//     }
//     return undefined
//   }, [activeNetwork.id, blocks])
//
//   return {
//     blocks: blocksFormatted,
//     error,
//   }
// }

