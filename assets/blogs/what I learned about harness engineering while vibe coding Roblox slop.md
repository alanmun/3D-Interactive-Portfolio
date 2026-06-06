## Preamble
My latest side project is code named Operation: Roblox Slop Shop. The idea was that since AI agents have gotten good enough to churn out games (awful ones, but still technically games) maybe I could throw them at Roblox (which historically and contemporaneously has low standards for game quality), and have them mint out slop games from a common rubric.

I'm well into the idea now and what I've found from market research and working hands-on with both Claude Code and Codex via CLI is that I probably need to spend more time than I thought on game polish. Yes, kids often have lower standards but my target demo (12+ YoA) still has *some* standards that need to be met. For example: The daily spin mechanic can't fail to dispense them their winnings, and the core gameplay needs to actually feel good to win (and lose) when playing or no one will stick around.

But, the point of this blog isn't to talk about the game itself, maybe that can be another blog in the future. I want to recap what I've learned about vibe coding with agents. Vibe coding is pretty overloaded so I'll distinguish it: *I mean specifically avoiding looking at the code as much as possible, pretty much never, and using AI as the the means by which all build/code modifications to the game go through.*

## So, Claude Code or Codex?

The chatter on sites like Hackernews surrounding Anthropic and OpenAI remind me of being a kid and growing up during the "console wars", where users of Xbox and PlayStation were weirdly vitriolic to the "other team" and especially patriotic toward their corporation. I suppose it made sense in some ways—growing up, fitting in was was really important and if your friends were on the other machine it made it difficult to socialize. 

Total aside but: I remember once playing Modern Warfare 2 (2009) on the Xbox 360 and running my usual sniper build with the Barrett .50 on an open space map, ideal conditions for my goal of getting the 25 kill streak reward. I succeeded and had the most powerful item in the game: the Tactical Nuke. It forces the match to end with a dramatic countdown and voice lines from panicked, stressed out soldiers realizing their imminent death via nuclear detonation. Soon an explosion is heard followed by eerie silence, all players are killed and the match is declared an early victory for your team. If that doesn't sound impactful enough, I should mention that games ending via tactical nuke were very rare, I would say no more than 1 in 100 games ended this way. 

Unbeknownst to me, by sheer luck one of the "cool kids" at my school (being a social butterfly and/or playing hockey/football/basketball well made you cool at my school) happened to be in that same server to witness it. He DM'd me afterwards, lauding my skills, and I was shortly hit with multiple friend requests to play with the other "cool" Xbox kids for future matches. I definitely felt cooler after that.

![why-not-both](/assets/blogs/attachments/why-not-both.gif)
*Sometimes stressing my indifference to pick a side on the internet feels like this gif, except instead of being celebrated at the end I'm tossed into a dumpster*

Anyways, none of the dynamics of the console wars stuff is in play anymore. There's no reason to strap yourself to the hull of either corporation's metaphorical ship and pledge your willingness to die for them. 

So, don't. If money/circumstances allow, try both. Try more than just both. Get an openrouter account. Deepseek v4 Pro is quite impressive, too. And you can believe me, I've sifted through so many garbage open weights LLMs before I make that statement about Deepseek's latest offering.

<span style="background:ghostwhite; color:ghostwhite;">okay fine, I will say that Claude Code in the past 2 months has really shown itself to be more capable than Codex. On both harness's leading models and equivalent reasoning effort (high for CC, high for Codex), I've consistently noticed CC handle work for me with less hiccups. But I wouldn't be surprised if this trend reversed in a few months from now.</span>
## The Fundamentals of Harness Engineering
Both Anthropic and OpenAI have put out great resources on how good harness engineering is done, I've used a few of their articles as north stars for how I did my own work. I'll link them at the end of this post.

I'm going to skip past the more obvious stuff like "Use MCP and CLI tools so the agent can access more crap because more crap for it to read and write is more powerful than less crap for it to r/w". More interestingly:

### AGENTS.md

Most people reading this already know what this is. Mine started out like most projects initially did: I put behavioral guidance on how to handle coding, how conventions would go, how to verify and know that tasks were completed instead of just "sending it". 

Over time though, I realized that this file better functions as a directory that you use to point the agent towards more specific information on the things its trying to accomplish. You can (and probably should) put:
- where to find skills, when to use them
- expected development process for agents to follow (plan -> write -> test and verify)

you'd be surprised how often these agents get lazy and skip certain steps when they aren't explicitly enumerated or evidence of them in the past isn't there. For example if you already have a test suite but don't explicitly state that the agent must test, you have a solid chance of it writing more tests and running tests after its change, but its a coin toss.
### Skills

Very early on in the project I knew that skills would be crucial to transmitting the right context to the right agents without typing out instructions hundreds of times.

Here are some of the skills I ended up making, to give you a sense of what stuff was even worth turning into skills:
#### developing-roblox-maps

This skill covers all the nuances the agents need to know about writing code in Luau (Roblox's strain of Lua) as well as the design/architectural preferences for my games. What to do and what to leave to me, all the gotchas that the models kept mistakenly doing because of holes in their training data.

Originally, I even asked it to pretty please with a cherry on top run the `verify.sh` script which does a whole slew of things to validate code changes are green. I took it out of the skill, because as you'll see in a later section, I realized it was a perfect fit for a hook. 
#### asset-pipeline

This skill covers a lot of the small details that get messed up when pulling assets from the roblox creator store. For example, if you want to use images in your game, you have to upload them as 2D Decal assets and then extract an underlying Image asset from them. Agents would stumble here over and over until I added that tidbit to the skill.

Additionally, there are tons of cool folks that inject malware into scripts they package with free assets. And by cool folks I mean assholes that should be beaten to death with hammers 

#### publish-to-roblox
I wanted to use Claude Code remotely sometimes so I could playtest and develop on the go, so I made this skill. Essentially it explains how to, and the proper protocol for when to publish. If it finds `PUBLISH` as a root-level file in the project dir, it takes that to mean that it should publish because the user (me) is away from keyboard and can't publish. It doesn't use the API since Roblox 409s me for no reason when I publish through the API more than a few times per month, so instead it uses MCP to draw focus on Roblox Studio, and then execute Alt+P to trigger a publish. There are more steps, but you get the idea. 

Why `PUBLISH`? When you have multiple agents running at the same time, they all want to know whether they should be publishing after changes or not. An empty file is a shared resource that all agents can inspect and know what behavior to have depending on its existence. If they don't see the file, they assume that I am at my computer and to skip publishing.


### Hooks

#### PreToolUse Hook

After hundreds of agent turns, the spaghetti code really piles on. I noticed that we hit a mucky point where new feature additions were much more likely to come out buggy and introduce regressions, leading me to prompting for old features to be fixed over and over. Claude and I took a look under the hood and we found your usual tangled mess that happens when you evolve from a single starting file—god objects and other shitty anti-patterns galore. 

I ordered a total codebase refactor, cutting down files that had reached 10,000 lines of code. It took multiple passes. Claude was scared to do it all at once. 10,000 became 6,000 because 2,500 became 1,000 each refactoring breaking up the logic into more and more files and better separating concerns.

To make this level of spaghetti a thing of the past, I needed to impose some changes. I decided to go with a PreToolUse hook that would impose a LoC budget depending on the type of script:
 
Entrypoints (\*.server.lua, \*.client.lua)? 1000 lines of code
Per-game Adapter.lua? 800 lines of code
All other ModuleScripts? 600 lines of code

This is a heuristic, but it's worked surprisingly well to cut down on regressions and amplify progress.

I noticed that Claude Code would make the same lazy UI hack changes that would lead to breaking UI between Mobile <--> PC platforms. To prevent this, the script checks for things like setting raw font sizes directly and flags them, font sizes can only be set in a `Typography.lua` file to keep things cohesive. This has lead to font sizes being consistent much more often, and less pleading with the agent to make the text sizes look nice to next each other on new features.


#### Stop Hook
After some time I realized I wasn't taking advantage of hooks in Claude Code and Codex. We had this nice `verify.sh` script that I turned into an all-in-one validator, not just to keep things orderly for me, but to make it easier to get the agents to "pretty-pretty-please run this when you're done 🥺"

> [!QUESTION]  
> I have to wonder if the puppy eyes emoji boosts output quality from the agents..? 
> this little [arxiv paper](https://arxiv.org/abs/2510.04950) begs to differ

But why cross your fingers and hope that the agents do it when you can make it a gate that literally forces the agent to see the results of it if it fails at any point? Ever since this change, I've grown accustomed to seeing "All  green, build OK, X tests pass." much more often when I get pinged by Claude or return to my terminal.

Speaking of the script, it's pretty neat.  `verify.sh` runs a chain of validation steps: 
- formatting via `stylua`
- linting via `selene`
- type-checking via `luau-analyze`
- compile time issues via `luau` binary (catches things `luau-analyze` missed)
- `Lemur` + `TestEZ` unit tests
- and even heuristic based checks I custom built because some anti-patterns from the agents would routinely cause issues only catchable at runtime. 
	-  Checking that if X is present in Script A, it must find a partner Y defined in Script B (otherwise we'd get a runtime error)
- a build stamper so that the live runs log out the last commit and branch so we can sanity check easier
- `rojo build` as a final check to see if we have something launchable in Roblox Studio

My mind was focused mostly on shifting errors left as far as possible. I was the play-tester and product lead, and Claude Code and Codex were my developers. I wanted them as busy as possible and bringing me the goods with most of the scratches buffed out already.

## Crossfire
Another source of bugs I encountered came from agents stepping over each other in the line of duty, and damaging each other's code. The perceived intelligence of Claude Code/Codex seemed much higher to me when I kept it to 1 or 2 agents max. If I ran 4+ agents at the same time, it was all but certain they would ship broken code.

Some might wonder why not use worktrees. I am aware of git worktrees, but I am trying to aim for maximum velocity when I ship, and its a common pattern for me to ask multiple agents to ship 2-3 changes, and I playtest all 3 in one shot. I need them to be able to sync to one roblox studio instance running on the same machine and publish. I need to close the feedback cycle and make the loop as tiny as possible so that forward progress happens quickly, especially this early into the roblox experiment.

In the future, I think the move is to switch to a single coordinator "master" agent. Think something like a Claude Code instance on xhigh reasoning that you talk to and send ALL revisions and requests to, and it dispatches subagents with the added knowledge of who is touching what and can then get them to coordinate changes. It could give task A.1 and B.1 to one agent, and the other agent could actually take on task A.2 and B.2, instead of the more intuitive all of A and all of B split up. This way only one agent works in one sector of the codebase at a time. I'll admit I need to research this more to see if the harnesses handle this kind of subagent dispatching, but last I had used subagents, they were a bit too undercooked to handle this kind of work. So, multiple panes and windows split up via `tmux` is the way for now.

## Filling in the Gaps
There are some things that agents just can't do well, no matter what way you threaten or beg the agent. For those times you're just gonna have to do it the old fashioned way: yourself :)

This hasn't sprung up too much in my case, mostly because I designed constraints to end up with Roblox games that aren't animation heavy, that don't require insane quality environment and character art. I am able to tell the agent the rough idea, it implements, then I open studio in play mode and tweak props around, scale something up, and save the finishing touches that way.

This means that there are skills you have to learn yourself, though. That idea some people have of making the AI do everything 100% is a myth.

## Links, Citations, Whatever
- https://openai.com/index/harness-engineering/
- https://code.claude.com/docs/en/best-practices
- https://arxiv.org/abs/2510.04950