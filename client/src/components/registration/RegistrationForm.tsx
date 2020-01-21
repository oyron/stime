import React, { useState, ChangeEvent } from 'react';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TableContainer from '@material-ui/core/TableContainer';
import Button from '@material-ui/core/Button';

import Club from '../../model/club';
import Event from '../../model/event';
import _ from 'lodash';
import Participant from '../../model/participant';
import firebase from '../Firebase';

interface Props {
    event: Event,
    clubs: Club[],
    loadEventCallback: () => void
}

const RegistrationForm: React.FC<Props> = (props: Props) => {

    const [progress, setProgress] = useState(0);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [club, setClub] = useState('');
    const [eventClass, setEventClass] = useState('');
    const [firstNameValid, setFirstNameValid] = useState(true);
    const [lastNameValid, setLastNameValid] = useState(true);
    const [clubValid, setClubValid] = useState(true);
    const [eventClassValid, setEventClassValid] = useState(true);
    const [formValid, setFormValid] = useState(false);

    const firstNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.currentTarget.value;
        setFirstName(value);
        const newFirstNameValid = value.length > 0;
        setFirstNameValid(newFirstNameValid);
        validate(value);
    }
    const lastNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.currentTarget.value;
        setLastName(value);
        const newLastNameValid = value.length > 0;
        setLastNameValid(newLastNameValid);
        validate(undefined, value);
    }
    const eventClassChange = (event: ChangeEvent<{ value: unknown }>) => {
        const newEventClass = event.target.value as string;
        setEventClass(newEventClass);
        setEventClassValid(newEventClass.length > 0);
        validate(undefined, undefined, undefined, newEventClass);
    }
    const clubChange = (newClub:string) => {
        setClub(newClub);
        const newClubValid = !_.isNil(newClub) && newClub.length > 0;
        setClubValid(newClubValid);
        validate(undefined, undefined, newClub);
    }

    const validate = (newFirstName = firstName, newLastName = lastName, newClub = club, newEventClass = eventClass) => 
        setFormValid(newFirstName.length > 0 && newLastName.length > 0 && newClub.length > 0 && newEventClass.length > 0);

    const handleRegister = async () => {
        try {
            const participant: Participant = {
                id: '',
                firstName: firstName,
                lastName: lastName,
                club: club,
                eventClass: eventClass
            };
            await firebase.addParticipant(props.event.id, participant);
            setProgress(2);
        }
        catch (error) {
            console.error(error);
        }
    }
    const handleRegisterMore = () => {
        setFirstName('');
        setEventClass('')
        setProgress(0);
    }
    const handleEdit = () => setProgress(0);
    const handleNext = () => setProgress(1);

    let tempValue: string;
    const form = (

        <Grid container spacing={2}>
            <Grid item xs={6}>
                <FormControl fullWidth>
                    <TextField id="firstName" label="Fornavn" value={firstName} onChange={firstNameChange} error={!firstNameValid} />
                </FormControl>
            </Grid>
            <Grid item xs={6}>
                <FormControl fullWidth>
                    <TextField id="lastName" label="Etternavn" value={lastName} onChange={lastNameChange} error={!lastNameValid} />
                </FormControl>
            </Grid>
            <Grid item xs={6}>
            <FormControl fullWidth>
                    <Autocomplete
                        id="club"
                        freeSolo
                        value={club}
                        options={props.clubs.map(club => club.name)}
                        onChange={(event: any, newValue: any | null) => {
                            clubChange(newValue);
                        }}
                        onInputChange={(event: any, newValue: any) => {
                            tempValue = newValue; //neccessary due to bug in <Autocomplete>. Should be able to set state directlu
                            validate(undefined, undefined, newValue);
                        }}
                        onClose={(event: any) => {
                            if (tempValue) {
                                clubChange(tempValue);
                            }
                        }}
                        renderInput={params => (
                            <TextField {...params} label="Klubb" margin="normal" fullWidth InputProps={{ ...params.InputProps, type: 'search' }} error={!clubValid} style={{marginTop: '0'}}/>
                        )}
                    />
                </FormControl>
            </Grid>
            <Grid item xs={6}>
                <FormControl fullWidth>
                    <InputLabel id="event-class-label">Klasse</InputLabel>
                    <Select labelId="event-class-label" id="eventClass" value={eventClass} onChange={eventClassChange} error={!eventClassValid}>
                        {props.event.eventClasses.map(eventClass => (<MenuItem value={eventClass.name} key={eventClass.name}>{`${eventClass.name} (${eventClass.course})`}</MenuItem>))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={6} style={{textAlign: 'right'}}>
                <Button className="float-right" variant="contained" color="primary" onClick={handleNext} disabled={!formValid}>Neste</Button>
            </Grid>
        </Grid>
    );

    const step1 = (
        <Grid container>
            <Grid item xs={12} style={{textAlign: 'center'}}>
                <p style={{fontWeight: 'bold'}}>Du har registrert følgende: </p>

                <TableContainer style={{width: '50%', margin: 'auto', marginBottom: '20px'}}>
                    <Table size="small">
                        <TableBody>
                            <TableRow>
                                <TableCell>Fornavn</TableCell>
                                <TableCell>{firstName}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Etternavn</TableCell>
                                <TableCell>{lastName}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Klubb</TableCell>
                                <TableCell>{club}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Klasse</TableCell>
                                <TableCell>{eventClass}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
            <Grid item xs={6}><Button variant="contained" color="primary" onClick={handleEdit}>Endre</Button></Grid>
            <Grid item xs={6} style={{textAlign: 'right'}}><Button variant="contained" color="primary" className="float-right" onClick={handleRegister}>Meld på</Button></Grid>
        </Grid>
    );

    const step2 = (
        <div style={{textAlign: 'center', fontWeight: 'bold'}}>
            <p>Din påmelding er registrert!</p>
            <Button variant="contained" color="primary" className="float-right" onClick={handleRegisterMore}>Meld på flere</Button>
        </div>
    );

    if (progress === 0) {
        return form
    }
    if (progress === 1) {
        return step1;
    }
    return step2;

}

export default RegistrationForm;