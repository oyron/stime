import React, { useState, useEffect, ChangeEvent } from 'react';
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import Event from '../../model/event';
import { match } from "react-router-dom";
import moment from 'moment';

import ParticipantList from '../event-page/ParticipantList';
import StartNumberTab from './StartNumberTab';
import Firebase from '../Firebase';

interface MatchParams {
    eventId: string
}

interface Props {
    match: match<MatchParams>
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

const AdminPage: React.FC<Props> = (props: Props) => {

    const [event, setEvent] = useState<Event>(new Event("", "", "", "", new Date(), new Date(), new Date(), [], []));
    const [eventId, setEventId] = useState("");
    const [tabIndex, setTabIndex] = useState(0);
    const [name, setName] = useState("");
    const [eventType, setEventType] = useState("");
    const [description, setDescription] = useState("");
    const [startTime, setStartTime] = useState(new Date());
    const [registrationStart, setRegistrationStart] = useState(new Date());
    const [registrationEnd, setRegistrationEnd] = useState(new Date());

    const loadEvent = (e: Event) => {
        setEvent(e);
        setName(e.name);
        setEventType(e.eventType);
        setDescription(e.description);
        setStartTime(e.startTime);
        setRegistrationStart(e.registrationStart);
        setRegistrationEnd(e.registrationEnd);
    }


    const nameChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newName = e.currentTarget.value;
        setName(newName);
    };

    const eventTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newEventType = e.currentTarget.value;
        setEventType(newEventType);
    };

    const descriptionChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newDescription = e.currentTarget.value;
        setDescription(newDescription);
    };

    const startDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newStartTime = `${e.currentTarget.value}T${moment(startTime).format("HH:mm")}`;
        setStartTime(new Date(newStartTime));
    };

    const startTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newStartTime = `${moment(startTime).format("YYYY-MM-DD")}T${e.currentTarget.value}`;
        setStartTime(new Date(newStartTime));
    };

    const registrationStartChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newRegistrationStart = e.currentTarget.value;
        setRegistrationStart(new Date(newRegistrationStart));
    };

    const registrationEndChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newRegistrationEnd = e.currentTarget.value;
        setRegistrationEnd(new Date(newRegistrationEnd));
    };

    const saveEvent = () => {
        event.name = name;
        event.eventType = eventType;
        event.description = description;
        event.startTime = startTime;
        event.registrationStart = registrationStart;
        event.registrationEnd = registrationEnd;
        Firebase.updateEvent(eventId, event);
    }

    useEffect(() => {
        const eventId = props.match.params.eventId;
        setEventId(eventId);
        return Firebase.subscribeEvent(eventId, loadEvent);
    }, [props.match]);

    const infoTab = (
        
        <React.Fragment>
            <form noValidate autoComplete="off">
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <FormControl fullWidth>
                        <TextField id="name" label="Navn" onChange={nameChange} value={name}/>
                    </FormControl>
                </Grid>
                <Grid item xs={6}>
                    <FormControl fullWidth>
                        <TextField
                            id="start-date"
                            label="Dato"
                            type="date"
                            value={moment(startTime).format("YYYY-MM-DD")}
                            onChange={startDateChange}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </FormControl>
                </Grid>
                <Grid item xs={6}>
                    <FormControl fullWidth>
                        <TextField id="event-type" label="Øvelse" value={eventType} onChange={eventTypeChange}/>
                    </FormControl>
                </Grid>
                <Grid item xs={6}>
                    <FormControl fullWidth>
                    <TextField
                        id="start-time"
                        label="Første start"
                        type="time"
                        value={moment(startTime).format("HH:mm")}
                        onChange={startTimeChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                            inputProps={{
                            step: 300, // 5 min
                        }}
                    />
                    </FormControl>
                </Grid>
                <Grid item xs={6}>
                    <FormControl fullWidth>
                        <TextField id="description" label="Arrangementsinfo" value={description} onChange={descriptionChange} />
                    </FormControl>
                </Grid>
                <Grid item xs={6}>
                    <FormControl fullWidth>
                    <TextField
                        id="registration-start"
                        label="Påmelding åpner"
                        type="datetime-local"
                        value={moment(registrationStart).format("YYYY-MM-DDTHH:mm")}
                        onChange={registrationStartChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    </FormControl>
                </Grid>
                <Grid item xs={6}>
                    <FormControl fullWidth>
                    <TextField
                        id="registration-end"
                        label="Påmeldingsfrist"
                        type="datetime-local"
                        value={moment(registrationEnd).format("YYYY-MM-DDTHH:mm")}
                        onChange={registrationEndChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained" color="primary" onClick={saveEvent}>Lagre</Button>
                </Grid>
            </Grid>
            </form>
        </React.Fragment>
    );

    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setTabIndex(newValue);
    };

    return (
        <React.Fragment>
            <h2>Admin</h2>
            <AppBar position="static">
                <Tabs value={tabIndex} onChange={handleTabChange} aria-label="simple tabs example">
                    <Tab label="Arrangement"/>
                    <Tab label="Klasser"/>
                    <Tab label={event.hasStartList ? "Startliste" : `Deltakere (${event.participants.length})`}/>
                </Tabs>
            </AppBar>
            <TabPanel value={tabIndex} index={0}>
                {infoTab}
            </TabPanel>
            <TabPanel value={tabIndex} index={1}>
                <StartNumberTab event={event}/>
            </TabPanel>
            <TabPanel value={tabIndex} index={2}>
                <ParticipantList event={event}/>
            </TabPanel>
        </React.Fragment>
    );
    
}

export default AdminPage;