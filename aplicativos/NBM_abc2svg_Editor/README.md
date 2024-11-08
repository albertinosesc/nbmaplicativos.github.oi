README
======

This is Jean-François Moine's `abc2svg` repackaged for offline usage
on portable devices (e.g. pendrives). All you have to do is open
`abc2svg.xhtml` with any web browser, then you'll be able to manage your
ABC music anywhere.

Packaged by Guido Gonzato, PhD


How to make this archive
------------------------

You will need the zip archive of version 1.22.21. Get it from
<https://moinejf.free.fr/abc2svg.zip>.

- make the destination directory, called `DEST` in the following:

````
cd
mkdir Abc2svg-1.22.21
cd Abc2svg-1.22.21/
DEST=$(pwd)
````

- unpack the zip archive; the directory in it will be called `SOURCE`
in the following.

````
cd
unzip abc2svg.zip
cd abc2svg-v1.22.21
SOURCE=$(pwd)
````

- open `$SOURCE/edit-1.xhtml` with a web browser, right-click on the
pink area on the upper left, select `Save as...` then save as
`Webpage, complete`. File name: `abc2svg` in directory `DEST`.

- `abc2svg.xhtml` and the directory `abc2svg_files/` will be created.
To install the remaining scripts, run these commands:

````
cd $DEST/abc2svg_files
mkdir -p Scc1t2

# install the components
/bin/cp -f $SOURCE/*js .
/bin/cp -f $SOURCE/abctopdf .

# install the sound files
/bin/cp -f $SOURCE/Scc1t2/* Scc1t2
````

- zip the `$DEST` directory:

````
cd $DEST/..
NAME=$(basename $DEST)
zip -r $NAME.zip $NAME
````

- you're done. Enjoy it!
