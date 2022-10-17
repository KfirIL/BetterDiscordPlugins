/**
 * @name Quick Reaction
 * @description Lets you quickly react with a selected emoji.
 * @version 0.0.1
 * @author Kfir
 * @authorId 302774260236025857
 * @source https://github.com/KfirIL/BetterDiscordPlugins/tree/main/QuickReaction
 */
/*@cc_on
@if (@_jscript)
    
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();

@else@*/
const config = {
    main: "index.js",
    id: "QuickReaction",
    name: "Quick Reaction",
    author: "Kfir",
    authorId: "302774260236025857",
    authorLink: "",
    version: "0.0.1",
    description: "Lets you quickly react with a selected emoji.",
    website: "",
    source: "https://github.com/KfirIL/BetterDiscordPlugins/tree/main/QuickReaction",
    patreon: "",
    donate: "",
    invite: ""
};
class Dummy {
    constructor() {this._config = config;}
    start() {}
    stop() {}
}
 
if (!global.ZeresPluginLibrary) {
    BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.name ?? config.info.name} is missing. Please click Download Now to install it.`, {
        confirmText: "Download Now",
        cancelText: "Cancel",
        onConfirm: () => {
            require("request").get("https://betterdiscord.app/gh-redirect?id=9", async (err, resp, body) => {
                if (err) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                if (resp.statusCode === 302) {
                    require("request").get(resp.headers.location, async (error, response, content) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), content, r));
                    });
                }
                else {
                    await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                }
            });
        }
    });
}
 
module.exports = !global.ZeresPluginLibrary ? Dummy : (([Plugin, Api]) => {
     const plugin = (Plugin, Library) => {
    const {
        Patcher,
        WebpackModules,
        Tooltip
    } = Library;

    const { React, Dispatcher } = Library.DiscordModules;
    const { ContextMenu } = BdApi;
    const currentUserId = WebpackModules.getByProps("getUser").getCurrentUser().id;
    let emojisDb = [];

    const fetchEmojis = async (emoji) => {
        // Emojis names for discord (taken from discord-emoji-converter)
        const res = await fetch('https://raw.githubusercontent.com/ArkinSolomon/discord-emoji-converter/master/emojis.json');
        const data = await res.json();
        
        emojisDb = data;
    }

    const emojify = (emoji) => Object.entries(emojisDb).filter(entry => entry[0] === emoji);

    // A very ugly way to find MiniPopover "Module". Thanks, DISCORD!
    const miniPopover = WebpackModules.getModule(m => m.ZP && m.ZP.name === 'm'); 
    const miniPopoverBtn = miniPopover.zx;

    const toolTip = (e) => {
        if(e === null) return;
        new Tooltip(e.ref, "Quick Reaction", {
            style: 'grey'
        });
    }

    const ReactionTypes = {
        add: "MESSAGE_REACTION_ADD",
        remove : "MESSAGE_REACTION_REMOVE"
    }

    const onClickMainBtn = (msg, emoji) => {
        let reactionType = msg.reactions.some(reaction => reaction.emoji.name === emoji.name &&
             reaction.emoji.id === emoji.id && reaction.me) 
             ? ReactionTypes.remove : ReactionTypes.add; // Checking if you already reacted with this emoji.
        
        Dispatcher.dispatch({ // Adding/Removing reaction from the message.
            type: reactionType,
            channelId: msg.channel_id,
            messageId: msg.id,
            userId: currentUserId,
            emoji: emoji,
            optimistic: true
        })
    }

    const contextMenu = (component, target) => {
        let emoji = target.dataset.id === undefined ? {
            animated: false,
            id: null,
            name: emojify(target.dataset.name)[0][1]
        } : {
            animated: target.firstElementChild.src.includes(".gif"),
            id: target.dataset.id,
            name: target.dataset.name
        };


        const quickReaction = ContextMenu.buildItem({
            label: "Set as Quick Reaction",
            action: () => {
                BdApi.Data.save(config.name, "Emoji", emoji)
            }
        })
        component.props.children = [component.props.children, quickReaction]
    }

return class extends Plugin {
        constructor() {
            super();
            this.emoji = BdApi.Data.load(config.name, "Emoji");
            if(this.emoji === undefined)
                BdApi.Data.save(config.name, "Emoji", {
                    animated: false,
                    id: null,
                    name: "😀"
                })
            this.unpatchContextMenu = ContextMenu.patch("expression-picker", (component, { target }) => contextMenu(component, target));
        }

        onStart() {
            fetchEmojis(); // Fetching emojis database

            Patcher.after(miniPopover, "ZP", (_, args, retValue) => {
                const wrraperProps = retValue.props.children[1].props;
                if(!wrraperProps.canReact) return; // Checking if You can react in this channel.

                const mainButton = () => {
                    return miniPopoverBtn({
                        text: 'Quick Reaction',
                        key: 'quick-reaction',
                        ref: toolTip,
                        onClick: () => {
                            this.emoji = BdApi.Data.load(config.name, "Emoji"); // Re-load emoji in case of any change.

                            onClickMainBtn(retValue.props.children[2].props.message, this.emoji); // Main click Function
                        },
                        children:
                        /*#__PURE__*/React.createElement("div", {
                            className: "sprite-2lxwfc",
                            style: {
                                "background-position": "0px 0px",
                                "background-size": "242px 110px",
                                "transform": "scale(1)",
                                "filter": "grayscale(100%)"
                            }
                        })
                    })
                }

                retValue.props.children = [mainButton(), ...retValue.props.children]; // Adding the main button
            })
        }

        onStop() {
            Patcher.unpatchAll();
            this.unpatchContextMenu();
        }
    };

};
     return plugin(Plugin, Api);
})(global.ZeresPluginLibrary.buildPlugin(config));
/*@end@*/