/**
 * @name QuickReaction
 * @invite undefined
 * @authorLink undefined
 * @donate undefined
 * @patreon undefined
 * @website https://github.com/KfirIL/BetterDiscordPlugins/tree/main/QuickReaction
 * @source https://raw.githubusercontent.com/KfirIL/BetterDiscordPlugins/main/QuickReaction/QuickReaction.plugin.js
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

module.exports = (() => {
    const config = {"info":{"name":"QuickReaction","authors":[{"name":"Kfir","discord_id":"302774260236025857","github_username":"KfirIL"}],"version":"1.0.0","description":"Lets you quickly react with a selected emoji.","github":"https://github.com/KfirIL/BetterDiscordPlugins/tree/main/QuickReaction","github_raw":"https://raw.githubusercontent.com/KfirIL/BetterDiscordPlugins/main/QuickReaction/QuickReaction.plugin.js"},"changelog":[{"title":"Release","items":["Thanks For Installing!"]}],"main":"index.js"};

    return !global.ZeresPluginLibrary ? class {
        constructor() {this._config = config;}
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
        load() {
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = module.exports = (Plugin, Library) => {
  const {
    Patcher,
    WebpackModules,
    DiscordModules,
    ContextMenu,
    Tooltip,
    ReactTools
  } = Library;
  const {
    React
  } = DiscordModules;
  const {
    loadData,
    saveData
  } = BdApi;
  return class QuickReaction extends Plugin {
    constructor() {
      super();
      this.quickReaction = {
        name: loadData(config.info.name, "Emoji Name"),
        id: loadData(config.info.name, "Emoji Id")
      };
      this.animated = loadData(config.info.name, "Animated");
      this.emojis = loadData(config.info.name, "Emojis");
      this.ref = React.createRef();
    }

    onStart() {
      const url = 'https://raw.githubusercontent.com/KfirIL/BetterDiscordPlugins/main/QuickReaction/emojisToPosition.json';
      const response = fetch(url);
      const data = response.then(function (resp) {
        return resp.text();
      });
      data.then(d => {
        const emojis = JSON.parse(d).emojis;
        this.emojis = emojis;
        if (loadData(config.info.name, "Emojis") === undefined) saveData(config.info.name, "Emojis", this.emojis);else if (this.emojis !== loadData(config.info.name, "Emojis")) ;
        saveData(config.info.name, "Emojis", this.emojis);
      });

      if (this.quickReaction.name === undefined) {
        this.quickReaction.name = '😀';
        this.quickReaction.id = null;
        saveData(config.info.name, "Emoji Name", this.quickReaction.name);
        saveData(config.info.name, "Emoji Id", this.quickReaction.id);
      }

      const ExpressionPicker = WebpackModules.getModule(m => m?.default?.displayName == 'ExpressionPickerContextMenu');
      Patcher.after(ExpressionPicker, "default", (_, args, ret) => {
        const quickReacionMenuItem = ContextMenu.buildMenuItem({
          label: "Set Quick Reaction",
          action: () => {
            if (args[0].target.dataset.id !== undefined) {
              this.quickReaction.name = args[0].target.dataset.name;
              this.quickReaction.id = args[0].target.dataset.id;
              saveData(config.info.name, "Emoji Name", this.quickReaction.name);
              saveData(config.info.name, "Emoji Id", this.quickReaction.id);
              const url = "https://cdn.discordapp.com/emojis/" + this.quickReaction.id + ".gif?size=48&quality=lossless";
              fetch(url).then(res => {
                if (res.ok) this.animated = true;else this.animated = false;
                saveData(config.info.name, "Animated", this.animated);
              });
            } else {
              this.quickReaction.id = null;
              saveData(config.info.name, "Emoji Id", this.quickReaction.id);
              const clickedEmojiBackPos = args[0].target.firstChild.style.backgroundPosition;
              const clickedEmojiBackImage = args[0].target.firstChild.style.backgroundImage;
              Object.keys(this.emojis).forEach(elementr => {
                for (let i = 0; i < this.emojis[elementr].length; i++) {
                  const element = this.emojis[elementr][i];

                  if (element[1] === clickedEmojiBackPos && this.emojis[elementr][0][1] === clickedEmojiBackImage) {
                    this.quickReaction.name = element[0];
                    saveData(config.info.name, "Emoji Name", this.quickReaction.name);
                    return;
                  }
                }
              });
            }

            const buttons = document.getElementsByClassName('button-3bklZh');

            for (let i = 0; i < buttons.length; i++) {
              const element = buttons[i];

              if (element.id === this.ref.id) {
                ReactTools.getOwnerInstance(element).forceUpdate(this.quickReaction);
              }
            }
          }
        });
        const menuItems = [ret.props.children];
        menuItems.push(quickReacionMenuItem);
        ret.props.children = menuItems;
      });
      const miniPopover = WebpackModules.getModule(m => m?.default?.displayName == 'MiniPopover');
      Patcher.after(miniPopover, "default", (_, args, ret) => {
        const retProps = ret.props.children;
        if (!(retProps && retProps[1].props) || !retProps[1].props.canReact) return;
        const q = this;

        class Button extends React.Component {
          constructor(props) {
            super(props);
            this.props.tagName = 'div';
            this.state = {
              quickReaction: {
                name: q.quickReaction.name,
                id: q.quickReaction.id
              },
              visible: true
            };
            this.forceUpdate = this.forceUpdate.bind(this);
            this.invisible = this.invisible.bind(this);

            this.ref = e => {
              if (e !== null) new Tooltip(e, "Quick Reaction", {
                style: "grey"
              });
              q.ref = e;
            };
          }

          forceUpdate(value) {
            let reLoad = this.state.quickReaction;
            reLoad = {
              name: value.name,
              id: value.id
            };
            this.setState({
              quickReaction: {
                name: reLoad.name,
                id: reLoad.id
              }
            });

            this.ref = e => {
              if (e !== null) new Tooltip(e, "Quick Reaction", {
                style: "grey"
              });
              q.ref = e;
            };
          }

          emojiPos() {
            if (this.state.quickReaction.id !== null) return undefined;
            const emoji = this.state.quickReaction.name;
            let retValue;
            Object.keys(q.emojis).forEach(elementr => {
              for (let i = 0; i < q.emojis[elementr].length; i++) {
                const element = q.emojis[elementr][i];
                if (element[0] === emoji) return retValue = element[1];
              }
            });
            return retValue;
          }

          emojiUrl() {
            if (this.state.quickReaction.id !== null) return undefined;
            const emoji = this.state.quickReaction.name;
            let retValue;
            Object.keys(q.emojis).forEach(elementr => {
              for (let i = 0; i < q.emojis[elementr].length; i++) {
                const element = q.emojis[elementr][i];
                if (element[0] === emoji) return retValue = q.emojis[elementr][0][1];
              }
            });
            return retValue;
          }

          emojiBackSize() {
            if (this.state.quickReaction.id !== null) return '32px';
            const emoji = this.state.quickReaction.name;
            let retValue;
            Object.keys(q.emojis).forEach(elementr => {
              for (let i = 0; i < q.emojis[elementr].length; i++) {
                const element = q.emojis[elementr][i];
                if (element[0] === emoji) return retValue = q.emojis[elementr][1][1];
              }
            });
            return retValue;
          }

          invisible() {
            this.setState({
              visible: false
            });
          }

          customEmojiUrl() {
            const emoji = this.state.quickReaction.id;
            if (emoji === null) return undefined;

            const gifOrWebp = () => {
              if (q.animated === true) return 'gif';else return 'webp';
            };

            return 'https://cdn.discordapp.com/emojis/' + emoji + '.' + gifOrWebp() + '?size=48&quality=lossless';
          }

          customEmojiTag() {
            const emoji = this.state.quickReaction.id;
            if (emoji !== null) this.props.tagName = 'img';
          }

          render() {
            return this.state.visible ? /*#__PURE__*/React.createElement("div", {
              className: "button-3bklZh",
              ariaLabel: "Quick Reaction",
              id: "quick-reaction",
              role: "button",
              ref: this.ref,
              tabindex: "0",
              onClick: () => {
                this.forceUpdate(q.quickReaction);
                const reaction = WebpackModules.getByProps('addReaction', 'removeReaction');
                const messageReactions = retProps[2].props.message.reactions;
                const o = this;

                function add() {
                  reaction.addReaction(retProps[2].props.channel.id, retProps[2].props.message.id, o.state.quickReaction);
                }

                function remove() {
                  reaction.removeReaction(retProps[2].props.channel.id, retProps[2].props.message.id, o.state.quickReaction);
                }

                if (messageReactions.length === 0) return add();

                for (let i = 0; i < messageReactions.length; i++) {
                  if (messageReactions[i].me && messageReactions[i].emoji.name === this.state.quickReaction.name && messageReactions[i].emoji.id === this.state.quickReaction.id) return remove();else if (i === messageReactions.length - 1) add();
                }

                ;
              }
            }, this.customEmojiTag(), /*#__PURE__*/React.createElement(this.props.tagName, {
              className: "emojiSpriteImage-3ykvhZ",
              src: this.customEmojiUrl(),
              style: {
                "background-image": this.emojiUrl(),
                "background-position": this.emojiPos(),
                "background-size": this.emojiBackSize(),
                "height": "32px",
                "width": "32px",
                "image-rendering": "-webkit-optimize-contrast",
                "position": "absolute",
                "transform": "scale(0.7)",
                "filter": "grayscale(100%) brightness(80%)"
              }
            })) : null;
          }

        }

        ;
        retProps.unshift( /*#__PURE__*/React.createElement(Button, {
          key: "quick-reaction"
        }));
      });
    }

    onStop() {
      Patcher.unpatchAll();
      const buttons = document.getElementsByClassName('button-3bklZh');

      for (let i = 0; i < buttons.length; i++) {
        const element = buttons[i];

        if (element.id === 'quick-reaction') {
          ReactTools.getOwnerInstance(element).invisible();
        }
      }
    }

  };
};;
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/