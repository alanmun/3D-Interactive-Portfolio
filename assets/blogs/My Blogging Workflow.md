I made this to document how I figured out a blogging setup in case its valuable to others and also to learn if there are even better ways of blogging.

My goals was to create as streamlined a workflow as possible. I wanted it to hassle-free so that it would encourage me to write more. Lower the activation energy, catalyze the reactions, you know?

### My current setup
I already do almost all my writings now inside of Obsidian in my vault. I should do another blog post on [Obsidian](https://obsidian.md/), because I am in love with this software even though I actually started out hating it.

I knew that I, like most engineers, am lazy and wouldn't write blogs unless I could make the process as stupidly easy as possible, so here's what I came up with:

1. I write blogs by creating a new note in my Obsidian vault's `blogs` folder. This causes a create file event to be caught by `Templater`, a community made plugin for Obsidian, and `Templater` uses a blog template file I made to prefill some stuff.
2. As I'm writing blogs, they aren't always ready for release. To control releases of blogs and have the ability to easily take them down, I simply add or remove "WIP" from the blog's title.
3. A pre-deploy script collects my blogs (which are simply markdown plaintext since Obsidian works with beautiful sexy awesome incredible markdown), filters out any WIPs, and includes the rest with my dev and dist builds of my website so I can preview them in case there are any issues

Now, I just continue to use the software I already use to do *all* of my writing, and I continue to deploy my website with the same command, and it just works!

![5c9a34b3-d93c-4e91-b9bf-22dd269619b3](/assets/blogs/attachments/5c9a34b3-d93c-4e91-b9bf-22dd269619b3.png)
(its supposed to be me in love with markdown. the baguette is because I use "young stocky french man with black wavy hair" as a shortcut to generate guys that look like me lol)