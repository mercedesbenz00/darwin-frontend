## darwin-frontend icons

We want to avoid any duplicate svg's in future thats why we have versioning for these folders now.
We reflect the naming concept from figma in here. Most Icons in Figma are named like directories.
As an example we take the **Complete Stage** icon.

In Figma the Icon is called `Icon/Colored/Complete`, in code we export and import it as `IconColoredComplete` and
place it in the dedicated directory which would be `.../assets/icons/V2/Colored/*`.

The name for that svg inside the above mentioned directory wouldn't be `IconColoredComplete`, we just want to export
it like that inside the index.ts. Instead we want to call it what it is - `complete.svg`

If there is no sub-dir for the `Icon/*` feel free to create one

Please don't slam any icons in there like we did in `icons/V1`
