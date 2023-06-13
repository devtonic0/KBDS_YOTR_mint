import Head from "next/head";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import {
  CandyMachine,
  Metaplex,
  Nft,
  NftWithToken,
  PublicKey,
  Sft,
  SftWithToken,
  walletAdapterIdentity,
} from "@metaplex-foundation/js";
import { Keypair, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import mintImage from "../public/MintImage.png";
import {
  getRemainingAccountsForCandyGuard,
  mintV2Instruction,
} from "@/utils/mintV2";
import { fromTxError } from "@/utils/errors";

export default function Home() {
  const [mintCount, setMintCount] = useState<number>(1);
  const wallet = useWallet();
  const { publicKey } = wallet;
  const { connection } = useConnection();
    // Get the Solana balance of the connected wallet
   
  const [metaplex, setMetaplex] = useState<Metaplex | null>(null);
  const [candyMachine, setCandyMachine] = useState<CandyMachine | null>(null);
  const [collection, setCollection] = useState<
    Sft | SftWithToken | Nft | NftWithToken | null
  >(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [items, setItems] = useState({
    available: 0,
    remaining: 0,
    redeemed: 0,
  });

  // Set the target date and time (Friday, June 9th, 2023 at 16:00:00 UTC)
  const targetDate = new Date("2023-06-09T18:00:00Z");
  const [phase1Completed, setPhase1Completed] = useState(false);

  // Calculate the remaining time until the target date
  const calculateRemainingTime = () => {
    const currentTime = new Date();
    const remainingTime = targetDate.getTime() - currentTime.getTime();

    if (remainingTime > 0) {
      const remainingSeconds = Math.floor(remainingTime / 1000) % 60;
      const remainingMinutes = Math.floor(remainingTime / (1000 * 60)) % 60;
      const remainingHours = Math.floor(remainingTime / (1000 * 60 * 60)) % 24;
      const remainingDays = Math.floor(remainingTime / (1000 * 60 * 60 * 24));

      // Calculate the remaining time for the second phase (an hour ahead)
      const phase2RemainingTime = remainingTime  // Subtract 1 hour in milliseconds
      const phase2RemainingSeconds =
        Math.floor(phase2RemainingTime / 1000) % 60;
      const phase2RemainingMinutes =
        Math.floor(phase2RemainingTime / (1000 * 60)) % 60;
      const phase2RemainingHours =
        Math.floor(phase2RemainingTime / (1000 * 60 * 60)) % 24;
      const phase2RemainingDays = Math.floor(
        phase2RemainingTime / (1000 * 60 * 60 * 24)
      );

      // Calculate the remaining time for the third phase (2 hours ahead)
      const phase3RemainingTime = remainingTime ; // Subtract 2 hours in milliseconds
      const phase3RemainingSeconds =
        Math.floor(phase3RemainingTime / 1000) % 60;
      const phase3RemainingMinutes =
        Math.floor(phase3RemainingTime / (1000 * 60)) % 60;
      const phase3RemainingHours =
        Math.floor(phase3RemainingTime / (1000 * 60 * 60)) % 24;
      const phase3RemainingDays = Math.floor(
        phase3RemainingTime / (1000 * 60 * 60 * 24)
      );

      return {
        days: remainingDays,
        hours: remainingHours,
        minutes: remainingMinutes,
        seconds: remainingSeconds,
        phase2Days: phase2RemainingDays,
        phase2Hours: phase2RemainingHours,
        phase2Minutes: phase2RemainingMinutes,
        phase2Seconds: phase2RemainingSeconds,
        phase3Days: phase3RemainingDays,
        phase3Hours: phase3RemainingHours,
        phase3Minutes: phase3RemainingMinutes,
        phase3Seconds: phase3RemainingSeconds,
      };
    }

    // If the target date has passed, return all zeros
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      phase2Days: 0,
      phase2Hours: 0,
      phase2Minutes: 0,
      phase2Seconds: 0,
      phase3Days: 0,
      phase3Hours: 0,
      phase3Minutes: 0,
      phase3Seconds: 0,
    };
  };

  // State variables to store the remaining time
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [phase2Days, setPhase2Days] = useState(0);
  const [phase2Hours, setPhase2Hours] = useState(0);
  const [phase2Minutes, setPhase2Minutes] = useState(0);
  const [phase2Seconds, setPhase2Seconds] = useState(0);
  const [phase3Days, setPhase3Days] = useState(0);
  const [phase3Hours, setPhase3Hours] = useState(0);
  const [phase3Minutes, setPhase3Minutes] = useState(0);
  const [phase3Seconds, setPhase3Seconds] = useState(0);
  

  // Function to update the remaining time every second
  const updateRemainingTime = () => {
    const remainingTime = calculateRemainingTime();
    setDays(remainingTime.days);
    setHours(remainingTime.hours);
    setMinutes(remainingTime.minutes);
    setSeconds(remainingTime.seconds);
    setPhase2Days(remainingTime.phase2Days);
    setPhase2Hours(remainingTime.phase2Hours);
    setPhase2Minutes(remainingTime.phase2Minutes);
    setPhase2Seconds(remainingTime.phase2Seconds);
    setPhase3Days(remainingTime.phase3Days);
    setPhase3Hours(remainingTime.phase3Hours);
    setPhase3Minutes(remainingTime.phase3Minutes);
    setPhase3Seconds(remainingTime.phase3Seconds);
    if (remainingTime.days === 0 && remainingTime.hours === 0 && remainingTime.minutes === 0 && remainingTime.seconds === 0) {
      setPhase1Completed(true);
    }
  };

  useEffect(() => {
    (async () => {
      if (wallet && connection && !collection && !candyMachine) {
        if (!process.env.NEXT_PUBLIC_CANDY_MACHINE_ID) {
          throw new Error("Please provide a candy machine id");
        }
        const metaplex = new Metaplex(connection).use(
          walletAdapterIdentity(wallet)
        );
        setMetaplex(metaplex);

        const candyMachine = await metaplex.candyMachines().findByAddress({
          address: new PublicKey(process.env.NEXT_PUBLIC_CANDY_MACHINE_ID),
        });
        setCandyMachine(candyMachine);

        setItems({
          available: candyMachine.itemsAvailable.toNumber(),
          remaining: candyMachine.itemsRemaining.toNumber(),
          redeemed: candyMachine.itemsMinted.toNumber(),
        });

        const collection = await metaplex
          .nfts()
          .findByMint({ mintAddress: candyMachine.collectionMintAddress });

        setCollection(collection);
      }

      updateRemainingTime();

      // Update the remaining time every second
      const timerId = setInterval(updateRemainingTime, 1000);

      // Clean up the timer on component unmount
      return () => {
        clearInterval(timerId);
      };
    })();

    const targetTime = new Date();
    targetTime.setUTCHours(17, 0, 0, 0); // Set the target time to 4pm UTC

    const updateTimer = () => {
      const currentTime = new Date();
      const remainingTime = targetTime.getTime() - currentTime.getTime();

      if (remainingTime > 0) {
        const remainingHours = Math.floor(remainingTime / (1000 * 60 * 60));
        const remainingMinutes = Math.floor(
          (remainingTime % (1000 * 60 * 60)) / (1000 * 60)
        );
        const remainingSeconds = Math.floor(
          (remainingTime % (1000 * 60)) / 1000
        );

        setHours(remainingHours);
        setMinutes(remainingMinutes);
        setSeconds(remainingSeconds);
      }
    };

    const timerId = setInterval(updateTimer, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [wallet, connection]);

  /** Mints NFTs through a Candy Machine using Candy Guards */
  const handleMintV2 = async () => {
    if (!metaplex || !candyMachine || !publicKey || !candyMachine.candyGuard) {
      if (!candyMachine?.candyGuard)
        throw new Error(
          "This app only works with Candy Guards. Please setup your Guards through Sugar."
        );

      throw new Error(
        "Couldn't find the Candy Machine or the connection is not defined."
      );
    }
   
  

    for (let i = 0; i < mintCount; i++) {
      const mintingToastId = toast.info("Minting in progress...", {
        position: "bottom-right",
        autoClose: false,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      try {
        const { remainingAccounts, additionalIxs } =
          getRemainingAccountsForCandyGuard(candyMachine, publicKey);

        const mint = Keypair.generate();
        const { instructions } = await mintV2Instruction(
          candyMachine.candyGuard?.address,
          candyMachine.address,
          publicKey,
          publicKey,
          mint,
          connection,
          metaplex,
          remainingAccounts
        );

        const tx = new Transaction();

        if (additionalIxs?.length) {
          tx.add(...additionalIxs);
        }

        tx.add(...instructions);

        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        const txid = await wallet.sendTransaction(tx, connection, {
          signers: [mint],
        });

        const latest = await connection.getLatestBlockhash();
        await connection.confirmTransaction({
          blockhash: latest.blockhash,
          lastValidBlockHeight: latest.lastValidBlockHeight,
          signature: txid,
        });

        toast.success("Mint successful!", {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } catch (e) {
        const msg = fromTxError(e);

        if (msg) {
          setFormMessage(msg.message);
          toast.error(msg.message, {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      }
    }
  };

  let costValue = 0;
  let costLabel = "Free mint";
  let paymentType = "SOL";
  
  if (candyMachine) {
    if (candyMachine.candyGuard?.guards.solPayment) {
      costValue = Number(candyMachine.candyGuard?.guards.solPayment?.amount.basisPoints) / 1e9;
      paymentType = "SOL";
    } else if (candyMachine.candyGuard?.guards.tokenPayment) {
      costValue = Number(candyMachine.candyGuard?.guards.tokenPayment?.amount.basisPoints) / 1e8;
      paymentType = "KNUKL";
    }
    costLabel = costValue.toFixed(2) + " " + paymentType;
  }

  const totalMinted = items.redeemed;
  const totalRemaining = items.remaining;
  const percentageRemaining = Math.floor(
    (totalMinted / (totalMinted + totalRemaining)) * 100
  );

  return (
    <>
      <Head>
        <title>YOTR Mint Site</title>
        <meta name="description" content="YOTR Mint Site" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=yes"
        />
      </Head>
      <ToastContainer />

      <main className="main-container">
        <div className="left-container">
          <img
            className="logo-image"
            src="https://i.ibb.co/T8msNgb/YOTR-mint-logo.png"
          ></img>
          <p className="description-text">
            The Year of the Rabbit mint features some of the best art in the
            Solana space in a truly unique comic collector card style that
            serves to further the Knuckle Bunny lore. In addition, the
            collection contains numerous{' '}
            <span className="easter-eggs">&lsquo;Easter Eggs&rsquo;</span> which entitle the
            minter to a variety of potential additional prizes ranging from merch
            to NFTs as well as Solana prizes, and throughout the mint we are
            running a{' '}
            <span className="heist-contest">&lsquo;THE HEIST&rsquo; contest</span> - be the
            first to solve the code and you take home the contents of the safe,
            which continues to grow throughout the mint!
          </p>
          <div className="mint-info-container">
            <div className="mint-section">
              <div className="section-header">
                <p> $KNUKL Mint</p>
                <div className="start-time">
                  
                </div>
              </div>
              <div className="section-content">
                <p>OG • Price 333 $KNUKL</p>
                <div className="countdown-timer">
                 
                  <p className="timer-value">CLOSED</p>
                
                </div>
              </div>
            </div>
            <div className="mint-section">
              <div className="section-header">
                <p> Whitelist Mint</p>
                <div className="start-time">
                  
                </div>
              </div>
              <div className="section-content">
                <p>WHITELIST • Price 0.77 SOL (2/Per)</p>
                <div className="countdown-timer">
                <p className="timer-value">CLOSED</p>
                </div>
              </div>
            </div>
            <div className="mint-section">
              <div className="section-header">
                <p> Public Mint</p>
                <div className="start-time">
                
                </div>
              </div>
              <div className="section-content">
                <p>UNLIMITED • Price 1 SOL</p>
                <div className="countdown-timer">
                  <p className="timer-value">LIVE</p>
              
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="right-container">
          <img className="sneak-image" src="../sneak.png" />
          <div className="mint-container">
            <div className="left-section">
            
              <div className="progress-bar-container">
                <div className="progress-bar-value" style={{ width: `${percentageRemaining}%` }}></div>
              </div>
              <div className="progress-bar-label">
                <span>{percentageRemaining}%</span>
                <span>
                  ({totalMinted}/{totalMinted + totalRemaining})
                </span>
              </div>
              <progress
                className="progress-bar"
                max={totalMinted + totalRemaining}
                value={totalMinted}
              />
              {formMessage}
            </div>
            <div className="right-section">
              <div className="multiMint">
               
                  <button
                    type="button"
                    onClick={() => setMintCount(Math.max(mintCount - 1, 1))}
                  >
                    -
                  </button>
                  <span>{mintCount}</span>
                  <button
                    type="button"
                    onClick={() => setMintCount(Math.min(mintCount + 1, 50))}
                  >
                    +
                  </button>
                
                <div className="mint-cost">
                  {mintCount ? (mintCount * costValue).toFixed(2) + ' ' + paymentType : costLabel}
                </div>
              </div>
              <div className="balance">
                <div className="connect">
                  {publicKey ? (
               <button
               disabled={!publicKey || items.redeemed >= items.available  }
               onClick={handleMintV2}
             >
               Mint
             </button>
                  ) : (
                    <WalletMultiButton />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
