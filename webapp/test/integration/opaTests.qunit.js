sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'zsbvatr1050/test/integration/FirstJourney',
		'zsbvatr1050/test/integration/pages/MainMain'
    ],
    function(JourneyRunner, opaJourney, MainMain) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('zsbvatr1050') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheMainMain: MainMain
                }
            },
            opaJourney.run
        );
    }
);