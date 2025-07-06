import React from 'react'
import { Container, Typography, Box } from '@mui/material'

const About = () => {
    return (
        <Container sx={{ mt: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    About the Journal Management System
                </Typography>
                <Typography variant="body1" paragraph>
                    Welcome to the Associate Editor Portal of our Journal Management System. As an Associate Editor, this platform provides a streamlined environment 
                    to manage your editorial assignments and collaborate with authors, reviewers, and senior editors effectively.
                </Typography>
                <Typography variant="body1" paragraph>
                    Your role is critical in overseeing the peer review process, ensuring the quality and relevance of submitted manuscripts, and guiding them through editorial decisions. 
                    This system centralizes all necessary tools to help you perform these responsibilities efficiently and professionally.
                </Typography>
                <Typography variant="body1" paragraph>
                    Our goal is to support your editorial work with clarity, ease of use, and powerful features that reduce administrative overhead and enhance communication.
                </Typography>
                <Typography variant="body1" paragraph>
                    Key features available to you as an Associate Editor:
                </Typography>
                <ul>
                    <li>Receive and manage manuscript assignments from the Editor-in-Chief or Area Editors</li>
                    <li>Select and assign suitable reviewers based on expertise</li>
                    <li>Track reviewer progress and send reminders if needed</li>
                    <li>Submit recommendations with justifications based on reviewer feedback</li>
                    <li>Communicate with reviewers and editorial team within the system</li>
                    <li>Access historical assignments and decisions for reference</li>
                    <li>Maintain your profile, areas of expertise, and availability preferences</li>
                </ul>
                <Typography variant="body1" paragraph>
                    We appreciate your dedication to upholding the integrity of academic publishing and are committed to supporting your work through this robust platform.
                </Typography>
            </Box>
        </Container>
    )
}

export default About;
