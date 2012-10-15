## Welcome

This is the primary resources page of Skyproc. Here you will find all the materials needed to run and use the software. 

To start using Skyproc, simply go to [skyproc.com](http://www.skyproc.com/) and create an account. (**will be launched on November 2012**).

Want to install your own Skyproc server ? Go to the [SVA wiki page](https://github.com/skygeek/skyproc/wiki/Skyproc-Virtual-Appliance-%28SVA%29/) for instructions. (**SVA download will be available at the same time of the beta launch**).

### What is Skyproc

Skyproc is a free software project that aims to build a comprehensive and integrated application for the skydive industry, so to fulfill the needs of dropzones and skydivers. The global goals of Skyproc are to :

- Create a centralized system using the latest Internet technologies to provide a real time platform where every actor can log in and manipulate the data relevant for him. 
- Try to stay as flexible as possible within the system work flows and paradigms. 
- Create an enterprise grade software.
- Be international.

### Current state

The first beta version is almost ready, it will be launched in mid November 2012. Here is a summary of features that will be supported by this release :

- **Multi dropzones resources manager**: DZ description, aircrafts, staff members and catalogs. 
- **Club members**: memberships, profiling and multi currencies accounts management. 
- **Lift manager**: a real time loads manager with live informations broadcast and self manifesting capabilities.
- **Automatic jump logbook maintainer** for members.
- **Dropzone reporting**: detailed logs of loads and aggregated tables.


Those features are sufficient to handle a day by day activity of a dropzone and generate reports. The beta release can be put in a real testing environment, but I don't recommend it, there may still exist some obscure minor bugs that can have a big impact ! If stability is a requirement for your dropzone, please wait for the stable release.

What I recommend during the beta phase is to use Skyproc to simulate your dropzone, either with dummy data or by using your real data.


### Roadmap

After the first beta release, development will focus on enhancing current features, addressing new issues and writing documentation. Testing and feedbacks from the skydive community will be much appreciated.

Another important goal of the beta period is to allow skydivers and dropzone operators to assess the software and give feedbacks about Skyproc so it can evolves to the best fit for everyone. 

When beta testing is complete, development of new features will resume. Here is a list of features in the bucket :

1. **Finish the reservation module**, a preview will be available in the beta release but you can only use it to record reservations by hand, and those reservations cannot be used yet in loads manifesting.
1. **Automatic lift manager**: a feature that let the software automatically create and fill loads based on members self manifesting and confirmed reservations that have checked in. This feature needs timing informations about aircrafts usage cycle, the fields to enter those informations are already present in the beta version, they are recorded but not yet used. 
1. **Teams management**: let members create groups of interest (pro teams, club fellows, etc...) so they can handle their jumping in a different paradigm, for example it will be possible to create jump programs that includes multiple jumps with multiple slots and use those jump programs in reservations and manifesting to avoid repetitive data entry. Teams can also be used to do cross reservations and manifesting (reserving or manifesting other people) while offering a system for defining permissions (who can manifest who and for what).
1. **Events management**: a module to create special events and facilitate their handling (slots needed, people involved, pricing, priorities, etc...). An example of that could be a boogie, a training camp or may be the 1000° jump of a friend that should occur on the sunset with all the team in the load for a memorable souvenir !
1. **Competitions management**: this module is a companion of the events module and will be used to create competition like events with scoring calculations, rankings and broadcasting facilities. 
1. **Public reservation plugin**: a web page that can be used publicly (without registering to Skyproc) to book for tandems mainly but not exclusively. The catalog module will propose an interface to customize the public offering. The plugin can be used either as a standalone web page or can be integrated into the dropzone website.
1. **Wind tunnel management**: extend all features related to aircrafts management for handling vertical wind tunnels, there is a lot of similarities between the two and often people are the same. There is also locations that both offers aircraft jumps and tunnel time, so the benefits of a global system are obvious.

The items bellow are some "not yet very clear" ideas that can be implemented :

1. **Regulation**: create an abstract component to modelize the regulation model a dropzone is following (licenses levels and names, personal requirements, documents needed, etc...) and enforce it if desirable.
1. **Parachutes**: a system for managing individual and/or stock parachutes lifetime. Parachutes management can also be linked to loads management for handling parachutes rental and packing.
1. **Aircraft maintenance**: based on lifts count, the system can maintain some kind of data to schedule aircrafts maintenance. I'm not very sure if such a feature can be useful... I'm not aware of aircraft maintenance requirements, any feedback on this item will help a lot !

And finally here are some items that are in the "wish list" and for which I don't have enough skills. 

- Enhance the visual design and create some art works.
- Create one minute how-to videos.
- Translate the software into more languages.

If you think about any useful feature or have any suggestion about what precede, or are willing to help any way, please feel free to leave a message.

### Contact
Email <contact@skyproc.com>

On [Facebook](http://www.facebook.com/skyproc)

On [Twitter](http://www.twitter.com/skyproc)


### Credits

Skyproc is built on many underlying open source libraries. For a full list please consult the [credits page](https://github.com/skygeek/skyproc/wiki/Credits).
