![](https://circleci.com/gh/brekk/glass-menagerie.svg?style=shield&circle-token=55f2885e65a163dee6ea47f7aa1c71c81b0d552c)

# glass-menagerie
> "Yes, I have tricks in my pocket, I have things up my sleeve. But I am the opposite of a stage magician. He gives you illusion that has the appearance of truth. I give you truth in the pleasant disguise of illusion."
> "How beautiful it is, and how easily it can be broken."
> - Tennessee Williams

### Toolkit to convert jsx to pug (formerly jade)

This library may be potentially brittle for other people's use cases; but the goal is to help facilitate snapshots of an existing codebase (written in JSX) as `.pug` / `.jade` output, which is then consumed further downstream in a codepen / jsfiddle environment.

Broadly, jade / pug is easier to manipulate and has a lower learning curve for non-developers; this tool will help designers on the team have a living style-guide which is easily modifiable. (That's the goal anyway.)
