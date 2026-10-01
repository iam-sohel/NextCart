FROM eclipse-temurin:21-jre

WORKDIR /app

# Update OS packages to patched versions
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN groupadd --system havlook && \
    useradd --system --gid havlook --create-home havlook

# Copy the application JAR
COPY target/*.jar app.jar

# Give ownership to the non-root user
RUN chown -R havlook:havlook /app

# Run the application as non-root
USER havlook

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]