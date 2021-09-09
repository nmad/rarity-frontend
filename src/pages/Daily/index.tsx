import daycare_img from '../../assets/images/daycare_img.png'
import daycare from '../../assets/images/daycare.png'
import bottle from '../../assets/images/bottle.png'
import training from '../../assets/images/training.png'
import { useUserSummoners } from '../../state/user/hooks'
import SummonerCard from '../../components/Summoner/Card'
import { useCallback, useEffect, useState } from 'react'
import useRarity from '../../hooks/useRarity'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import { MULTIADVENTURE_CONTRACT } from '../../constants'
import useDailyCare from '../../hooks/useDailyCare'

export default function Main(): JSX.Element | null {
    const { library, chainId, account } = useActiveWeb3React()

    const summoners = useUserSummoners()

    const { allowance, approve } = useRarity()

    const { register } = useDailyCare()

    async function sendDailyCare(ids: string[], days: number): Promise<void> {
        await register(ids, days)
    }

    async function approveMultiAdventure() {
        if (!chainId) return
        await approve(MULTIADVENTURE_CONTRACT[chainId])
    }

    const [multiadv, setMultiAdv] = useState<{
        approved: boolean
    }>({ approved: false })

    const fetch = useCallback(async () => {
        if (!chainId) return
        const allowed = await allowance(account, MULTIADVENTURE_CONTRACT[chainId])
        setMultiAdv({
            approved: allowed,
        })
    }, [allowance, account, chainId])

    useEffect(() => {
        if (!account || !library) return
        fetch()
    }, [fetch, account, library])

    const [registerDays, setRegisterDays] = useState(0)

    return (
        <>
            <div className="w-full mb-44">
                <img alt="sword" src={daycare_img} className="mx-auto w-16 mt-4 md:w-32" />
                <img alt="sword" src={daycare} className="mx-auto w-52 mt-4 md:w-64" />
            </div>
            <div className="w-full bg-custom-blue text-center pb-24">
                <img alt="sword" src={bottle} className="mx-auto w-52 -m-32" />
                <img alt="sword" src={training} className="mx-auto w-52 mt-32 md:w-1/4 mb-8" />
                <span className="text-md md:text-2xl text-white mb-14">Automate Daily Check-in For Your Adventure</span>
                <p className="w-full text-x text-white my-4">Register all summoners to Daily Care!</p>
                <input
                    className="text-2xl w-16 bg-custom-green border-2 border-white rounded text-center text-white"
                    type="number"
                    onChange={(v) => {
                        setRegisterDays(parseInt(v.target.value))
                    }}
                />
                <span className="text-2xl text-white mx-2">Days</span>
                {multiadv.approved ? (
                    <button
                        className="bg-custom-green border-8 border-white p-2 rounded-lg text-xl text-white my-4"
                        onClick={async () => {
                            await sendDailyCare(
                                summoners.map((summoner) => {
                                    return summoner.id
                                }),
                                registerDays
                            )
                        }}
                    >
                        Register
                    </button>
                ) : (
                    <button
                        className="bg-custom-green border-8 border-white p-2 rounded-lg text-xl text-white my-4"
                        onClick={async () => {
                            await approveMultiAdventure()
                        }}
                    >
                        Approve
                    </button>
                )}

                {summoners ? (
                    summoners.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-10/12 xl:w-8/12 mx-auto mt-10 gap-4">
                            {summoners.map((summoner) => {
                                return (
                                    <SummonerCard
                                        key={summoner.id}
                                        summoner={summoner}
                                        approved={multiadv.approved}
                                        approveFunc={approveMultiAdventure}
                                        registerFunc={sendDailyCare}
                                    />
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-white mt-10 text-2xl font-bold">
                            To be able to manage stats you need to have a summoner
                        </p>
                    )
                ) : (
                    <div />
                )}
            </div>
        </>
    )
}
