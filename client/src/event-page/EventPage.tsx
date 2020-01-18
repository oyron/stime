import React, { useState, useEffect } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableContainer from '@material-ui/core/TableContainer';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import Event from '../model/event';
import EventClass from '../model/eventClass';
import { match } from "react-router-dom";
import moment from 'moment';

import RegistrationModal from './RegistrationModal';
import ParticipantList from './ParticipantList';
import StartNumberTab from './StartNumberTab';
import Club from '../model/club';

interface MatchParams {
    eventId: string
}

interface Props {
    match: match<MatchParams>
}

const fetchEvent = async (eventId: string):Promise<Event> => {
    const eventBody = await fetch(`http://localhost:3001/api/event/${eventId}`)
    const eventObj = await eventBody.json();
    return Promise.resolve({
        id: eventObj.id, 
        name: eventObj.name,
        eventType: eventObj.eventType,
        description: eventObj.description,
        startTime: eventObj.startTime, 
        registrationStart: eventObj.registrationStart, 
        registrationEnd: eventObj.registrationEnd, 
        eventClasses: eventObj.eventClasses, 
        participants: eventObj.participants
    });
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: any;
    value: any;
  }

function TabPanel(props: TabPanelProps) {
    const { children, value, index } = props;
  
    return (
        <div hidden={value !== index}>
            {value === index && <React.Fragment>{children}</React.Fragment>}
        </div>
    );
  }

const EventPage: React.FC<Props> = (props: Props) => {

    const [event, setEvents] = useState<Event>({id: "", name: "", description: "", eventType: "", startTime: new Date(), registrationStart: new Date(), registrationEnd: new Date(), eventClasses:[], participants: []});
    const [clubs, setClubs] = useState<Club[]>([]);
    const [tabIndex, setTabIndex] = useState(0);

    const loadEvent = async () => {
        const eventId = props.match.params.eventId;
        const event = await fetchEvent(eventId);
        setEvents(event);
    }

    useEffect(() => {
        const fecthEvents = async () => {
            const eventId = props.match.params.eventId;
            const event = await fetchEvent(eventId);
            setEvents(event);
        }
        fecthEvents();
    }, [props.match]);

    useEffect(() => {
        const fecthEvents = async () => {
            const clubsBody = await fetch('http://localhost:3001/api/club')
            const clubsData = await clubsBody.json();
            setClubs(clubsData)
        }
        fecthEvents();
    }, []);

    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            root: {
                display: 'flex',
                flexWrap: 'wrap',
                    '& > *': {
                        margin: 0
                    },
                },
            eventClasses: {
                justifyContent: 'right'
            }
        }),
    );
    const classes = useStyles();
    const infoTab = (
        <React.Fragment>
            <div className={classes.root}>
                <Box width="49%">
                    <TableContainer component={Paper}>
                        <Table>
                            <TableBody>
                                <TableRow><TableCell>Dato:</TableCell><TableCell>{moment(event.startTime).format("DD. MMM YYYY")}</TableCell></TableRow>
                                <TableRow><TableCell>Arrangement:</TableCell><TableCell>{event.description}</TableCell></TableRow>
                                <TableRow><TableCell>Øvelse:</TableCell><TableCell>{event.eventType}</TableCell></TableRow>
                                <TableRow><TableCell>Første start:</TableCell><TableCell>{moment(event.startTime).format("HH:mm")}</TableCell></TableRow>
                                <TableRow><TableCell>Påmeldingsfrist:</TableCell><TableCell>{moment(event.registrationEnd).format("DD. MMM YYYY HH:mm")}</TableCell></TableRow>
                                <TableRow><TableCell>Påmeldingsfrist:</TableCell><TableCell>{event.description}</TableCell></TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
                <Box width="49%" className={classes.eventClasses}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Klasse</TableCell>
                                    <TableCell>Løype</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {event.eventClasses.map((ec:EventClass, idx:number) => (
                                    <TableRow key={ec.name}>
                                        <TableCell>{ec.name}</TableCell>
                                        <TableCell>{ec.course}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </div>
            <RegistrationModal event={event} clubs={clubs} loadEventCallback={loadEvent}/>
        </React.Fragment>
    );

    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setTabIndex(newValue);
    };

    return (
        <React.Fragment>
            <h2>{event.name}</h2>
            <AppBar position="static">
                <Tabs value={tabIndex} onChange={handleTabChange} aria-label="simple tabs example">
                    <Tab label="Informasjon"/>
                    <Tab label={`Deltakerliste (${event.participants.length})`}/>
                    <Tab label="Admin: startnummer"/>
                </Tabs>
            </AppBar>
            <TabPanel value={tabIndex} index={0}>
                {infoTab}
            </TabPanel>
            <TabPanel value={tabIndex} index={1}>
                <ParticipantList event={event}/>
            </TabPanel>
            <TabPanel value={tabIndex} index={2}>
                <StartNumberTab event={event}/>
            </TabPanel>
        </React.Fragment>
    );
    
}

export default EventPage;