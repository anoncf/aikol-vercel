import {
    Action,
    Content,
    elizaLogger,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@ai16z/eliza";
import { isAxiosError } from "axios";
import { TopWalletsAPI } from "../services/topwallets-api";

export const scanWalletAction: Action = {
    name: "SCAN_WALLET",
    similes: [
        "CHECK_WALLET",
        "ANALYZE_WALLET",
        "GET_WALLET_STATS",
        "GET_WALLET_PROFILE",
    ],
    description:
        "Scan a Solana wallet address to get detailed pnl statistics and profile information",
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        const text = (message.content as Content).text;
        const solanaAddressRegex = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;

        if (!text || typeof text !== "string") {
            return false;
        }

        const trimmedText = text.trim();
        if (trimmedText.match(solanaAddressRegex)?.[0] === trimmedText) {
            return false;
        }

        return solanaAddressRegex.test(text);
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown } = {},
        callback?: HandlerCallback
    ): Promise<boolean> => {
        if (!callback) {
            throw new Error("Callback is required for scanWallet action");
        }

        const text = (message.content as Content).text;
        const solanaAddressRegex = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
        const matches = text.match(solanaAddressRegex);

        if (!matches?.length) {
            await callback({
                text: "I couldn't find a valid Solana address in your message. Please provide a valid address.",
                action: "WALLET_SCAN_RESPONSE",
            });
            return true;
        }

        const address = matches[0];

        try {
            const api = TopWalletsAPI.getInstance();
            const response = await api.scanWallet(address);
            const walletData = response.data;

            let analysisText = "";

            // Header with wallet name/address
            if (walletData.name) {
                analysisText += `${walletData.name}\n`;
                analysisText += `├ ${address}\n`;
            } else {
                analysisText += `${address}\n`;
            }
            analysisText += `└ ${walletData.type === "kols" ? "⭐ Known Trader" : "👤 Wallet"}\n\n`;

            // Performance stats
            analysisText += `📊 Performance Stats (30d)\n`;
            analysisText += ` ├ Win Rate: ${walletData.winrate}%\n`;
            analysisText += ` ├ Tokens:   ${walletData.tokenTraded}\n`;
            analysisText += ` ├ PnL:      ${walletData.realizedPnl}\n`;
            analysisText += ` ├ ROI:      ${walletData.combinedRoi}\n`;
            analysisText += ` └ Invested: ${walletData.totalInvestedFormatted || "Unknown"}\n`;

            // Recent tokens section
            if (walletData.recentTokens.length > 0) {
                analysisText += `\n🪙 Recent Tokens\n`;
                walletData.recentTokens.slice(0, 3).forEach((token, index) => {
                    const prefix =
                        index === walletData.recentTokens.length - 1 ||
                        index === 2
                            ? " └"
                            : " ├";
                    analysisText += `${prefix} ${token.name} ($${token.symbol})\n`;
                    analysisText += `    ├ Holding: ${token.holding}\n`;
                    analysisText += `    └ ROI: ${token.roi}\n`;
                });
            }

            // Links section
            analysisText += `\n🔗 Links\n`;
            if (walletData.twitter_url) {
                analysisText += ` ├ 𝕏: ${walletData.twitter_url}\n`;
            }
            analysisText += ` └ More: https://www.topwallets.ai/solana/wallet/${address}`;

            await callback({
                text: analysisText,
                action: "WALLET_SCAN_RESPONSE",
                source: message.content.source,
            });

            return true;
        } catch (error) {
            elizaLogger.error("Wallet scan error", { error });

            const errorMessage = isAxiosError(error)
                ? `Failed to scan wallet: ${error.response?.data?.message || error.message}`
                : "An unexpected error occurred while scanning the wallet.";

            await callback({
                text: errorMessage,
                action: "WALLET_SCAN_RESPONSE",
            });

            return true;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Can you analyze this wallet: DNfuF1L62WWyW3pNakVkyGGFzVVhj4Yr52jSmdTyeBHm",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll scan that wallet for you. Here's what I found...",
                    action: "SCAN_WALLET",
                },
            },
        ],
    ],
};
